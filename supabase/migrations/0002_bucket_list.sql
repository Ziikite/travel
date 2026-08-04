-- 버킷리스트: 쇼핑리스트와 동일한 구조로, 예약/연락이 필요한 경험(마사지, 맛집 웨이팅 등)을
-- 관리한다. 연락 방법(위챗/따종디엔핑 등), 연락처, 가격, 예약 시간을 함께 기록한다.
--
-- 이 파일도 몇 번을 다시 실행해도 안전합니다(idempotent).

-- =========================================================
-- 1. bucket_lists / bucket_list_items
-- =========================================================
create table if not exists public.bucket_lists (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  title text not null default '버킷리스트',
  created_at timestamptz not null default now()
);

create table if not exists public.bucket_list_items (
  id uuid primary key default gen_random_uuid(),
  bucket_list_id uuid not null references public.bucket_lists(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  assigned_to uuid references public.profiles(id),
  place_id uuid references public.places(id),
  title text not null,
  contact_method text, -- 예: 웨이신(위챗), 따종디엔핑, 전화, 현장예약, 기타
  contact_info text, -- 위챗 아이디, 전화번호, 링크 등
  expected_price_cny numeric,
  actual_price_cny numeric,
  scheduled_at timestamptz,
  memo text,
  status text not null default 'pending' check (status in ('pending', 'booked', 'done', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- trip 생성 시 기본 버킷리스트도 함께 생성 (handle_new_trip 재정의)
create or replace function public.handle_new_trip()
returns trigger as $$
begin
  insert into public.trip_members (trip_id, user_id, role)
  values (new.id, new.owner_id, 'owner');

  insert into public.shopping_lists (trip_id, title)
  values (new.id, '쇼핑리스트');

  insert into public.bucket_lists (trip_id, title)
  values (new.id, '버킷리스트');

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- =========================================================
-- 2. updated_at 자동 갱신
-- =========================================================
drop trigger if exists bucket_list_items_set_updated_at on public.bucket_list_items;
create trigger bucket_list_items_set_updated_at before update on public.bucket_list_items
  for each row execute function public.set_updated_at();

-- =========================================================
-- 3. activity_logs 자동 적재 (log_activity에 bucket_list_items 분기 추가)
-- =========================================================
create or replace function public.log_activity()
returns trigger as $$
declare
  v_trip_id uuid;
  v_row record;
begin
  if tg_op = 'DELETE' then
    v_row := old;
  else
    v_row := new;
  end if;

  if tg_table_name = 'places' then
    v_trip_id := v_row.trip_id;
  elsif tg_table_name = 'place_votes' then
    select trip_id into v_trip_id from public.places where id = v_row.place_id;
  elsif tg_table_name = 'itinerary_places' then
    select trip_id into v_trip_id from public.itineraries where id = v_row.itinerary_id;
  elsif tg_table_name = 'shopping_items' then
    select trip_id into v_trip_id from public.shopping_lists where id = v_row.shopping_list_id;
  elsif tg_table_name = 'bucket_list_items' then
    select trip_id into v_trip_id from public.bucket_lists where id = v_row.bucket_list_id;
  end if;

  insert into public.activity_logs (trip_id, user_id, action_type, entity_type, entity_id)
  values (v_trip_id, auth.uid(), lower(tg_op), tg_table_name, v_row.id);

  return v_row;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists bucket_list_items_log_activity on public.bucket_list_items;
create trigger bucket_list_items_log_activity after insert or update or delete on public.bucket_list_items
  for each row execute function public.log_activity();

-- =========================================================
-- 4. RLS 헬퍼 함수
-- =========================================================
create or replace function public.trip_id_of_bucket_list(p_bucket_list_id uuid)
returns uuid language sql security definer set search_path = public stable as $$
  select trip_id from public.bucket_lists where id = p_bucket_list_id;
$$;

-- =========================================================
-- 5. RLS 활성화 + 정책
-- =========================================================
alter table public.bucket_lists enable row level security;
alter table public.bucket_list_items enable row level security;

drop policy if exists bucket_lists_select on public.bucket_lists;
create policy bucket_lists_select on public.bucket_lists for select
  using (public.is_trip_member(trip_id));
drop policy if exists bucket_lists_insert on public.bucket_lists;
create policy bucket_lists_insert on public.bucket_lists for insert
  with check (public.is_trip_editor(trip_id));
drop policy if exists bucket_lists_update on public.bucket_lists;
create policy bucket_lists_update on public.bucket_lists for update
  using (public.is_trip_editor(trip_id));
drop policy if exists bucket_lists_delete on public.bucket_lists;
create policy bucket_lists_delete on public.bucket_lists for delete
  using (public.is_trip_editor(trip_id));

drop policy if exists bucket_list_items_select on public.bucket_list_items;
create policy bucket_list_items_select on public.bucket_list_items for select
  using (public.is_trip_member(public.trip_id_of_bucket_list(bucket_list_id)));
drop policy if exists bucket_list_items_insert on public.bucket_list_items;
create policy bucket_list_items_insert on public.bucket_list_items for insert
  with check (public.is_trip_editor(public.trip_id_of_bucket_list(bucket_list_id)) and created_by = auth.uid());
drop policy if exists bucket_list_items_update on public.bucket_list_items;
create policy bucket_list_items_update on public.bucket_list_items for update
  using (public.is_trip_editor(public.trip_id_of_bucket_list(bucket_list_id)));
drop policy if exists bucket_list_items_delete on public.bucket_list_items;
create policy bucket_list_items_delete on public.bucket_list_items for delete
  using (public.is_trip_editor(public.trip_id_of_bucket_list(bucket_list_id)));

-- =========================================================
-- 6. Realtime 발행
-- =========================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'bucket_list_items'
  ) then
    execute 'alter publication supabase_realtime add table public.bucket_list_items';
  end if;
end;
$$;

-- =========================================================
-- 7. 기존에 생성된 여행방에도 버킷리스트가 없다면 채워준다
-- =========================================================
insert into public.bucket_lists (trip_id, title)
select t.id, '버킷리스트'
from public.trips t
where not exists (select 1 from public.bucket_lists b where b.trip_id = t.id);
