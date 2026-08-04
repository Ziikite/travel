-- 중국 여행 공동 플래너 MVP: 초기 스키마
-- users(profiles) / trips / trip_members / places / place_votes
-- / itineraries / itinerary_places / shopping_lists / shopping_items / activity_logs
--
-- 이 파일은 몇 번을 다시 실행해도 안전합니다(idempotent). 중간에 에러가 나서
-- 재실행하더라도, 이미 만들어진 객체는 건드리지 않고 빠진 부분만 채웁니다.

-- =========================================================
-- 1. profiles (auth.users 미러링)
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  email text not null,
  profile_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, nickname, profile_image)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- 2. trips / trip_members
-- =========================================================
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  title text not null,
  destination_city text,
  start_date date,
  end_date date,
  invite_code text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trip_members (
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  joined_at timestamptz not null default now(),
  primary key (trip_id, user_id)
);

-- trip 생성자를 owner로 자동 등록 + 기본 쇼핑리스트 생성
create or replace function public.handle_new_trip()
returns trigger as $$
begin
  insert into public.trip_members (trip_id, user_id, role)
  values (new.id, new.owner_id, 'owner');

  insert into public.shopping_lists (trip_id, title)
  values (new.id, '쇼핑리스트');

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_trip_created on public.trips;
create trigger on_trip_created
  after insert on public.trips
  for each row execute function public.handle_new_trip();

-- =========================================================
-- 3. places / place_votes
-- =========================================================
create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  amap_poi_id text, -- 지도 제공자에 무관한 범용 외부 POI 식별자(현재는 구글맵 place_id)
  name_zh text not null,
  name_ko text,
  address_zh text,
  latitude double precision,
  longitude double precision,
  coordinate_system text not null default 'WGS84',
  category text,
  priority text not null default 'want' check (priority in ('must', 'want', 'maybe')),
  stay_minutes integer,
  opening_hours text,
  memo text,
  status text not null default 'active' check (status in ('active', 'archived', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.place_votes (
  place_id uuid not null references public.places(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  vote_type text not null default 'want',
  created_at timestamptz not null default now(),
  primary key (place_id, user_id)
);

-- =========================================================
-- 4. itineraries / itinerary_places
-- =========================================================
create table if not exists public.itineraries (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  itinerary_date date not null,
  transport_type text,
  start_place text,
  end_place text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, itinerary_date)
);

create table if not exists public.itinerary_places (
  id uuid primary key default gen_random_uuid(),
  itinerary_id uuid not null references public.itineraries(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  visit_order integer not null default 0,
  planned_arrival time,
  planned_departure time,
  is_time_fixed boolean not null default false,
  is_meal boolean not null default false,
  reservation_time timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (itinerary_id, place_id)
);

-- =========================================================
-- 5. shopping_lists / shopping_items
-- =========================================================
create table if not exists public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  title text not null default '쇼핑리스트',
  created_at timestamptz not null default now()
);

create table if not exists public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  shopping_list_id uuid not null references public.shopping_lists(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  assigned_to uuid references public.profiles(id),
  place_id uuid references public.places(id),
  product_name text not null,
  product_name_zh text,
  quantity integer not null default 1,
  expected_price_cny numeric,
  actual_price_cny numeric,
  image_url text,
  reference_url text,
  purchase_type text not null default 'group' check (purchase_type in ('group', 'personal')),
  status text not null default 'pending' check (status in ('pending', 'purchased', 'out_of_stock', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- 6. activity_logs
-- =========================================================
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade,
  user_id uuid references public.profiles(id),
  action_type text not null,
  entity_type text not null,
  entity_id uuid,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 7. updated_at 자동 갱신
-- =========================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trips_set_updated_at on public.trips;
create trigger trips_set_updated_at before update on public.trips
  for each row execute function public.set_updated_at();
drop trigger if exists places_set_updated_at on public.places;
create trigger places_set_updated_at before update on public.places
  for each row execute function public.set_updated_at();
drop trigger if exists itineraries_set_updated_at on public.itineraries;
create trigger itineraries_set_updated_at before update on public.itineraries
  for each row execute function public.set_updated_at();
drop trigger if exists itinerary_places_set_updated_at on public.itinerary_places;
create trigger itinerary_places_set_updated_at before update on public.itinerary_places
  for each row execute function public.set_updated_at();
drop trigger if exists shopping_items_set_updated_at on public.shopping_items;
create trigger shopping_items_set_updated_at before update on public.shopping_items
  for each row execute function public.set_updated_at();
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- =========================================================
-- 8. activity_logs 자동 적재
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
  end if;

  insert into public.activity_logs (trip_id, user_id, action_type, entity_type, entity_id)
  values (v_trip_id, auth.uid(), lower(tg_op), tg_table_name, v_row.id);

  return v_row;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists places_log_activity on public.places;
create trigger places_log_activity after insert or update or delete on public.places
  for each row execute function public.log_activity();
drop trigger if exists place_votes_log_activity on public.place_votes;
create trigger place_votes_log_activity after insert or delete on public.place_votes
  for each row execute function public.log_activity();
drop trigger if exists itinerary_places_log_activity on public.itinerary_places;
create trigger itinerary_places_log_activity after insert or update or delete on public.itinerary_places
  for each row execute function public.log_activity();
drop trigger if exists shopping_items_log_activity on public.shopping_items;
create trigger shopping_items_log_activity after insert or update or delete on public.shopping_items
  for each row execute function public.log_activity();

-- =========================================================
-- 9. 초대 코드 조회/참여 RPC (RLS 우회 없이 안전하게 처리)
-- =========================================================
create or replace function public.get_trip_preview(p_invite_code text)
returns table (
  id uuid,
  title text,
  destination_city text,
  start_date date,
  end_date date
)
language sql security definer set search_path = public stable as $$
  select id, title, destination_city, start_date, end_date
  from public.trips
  where invite_code = p_invite_code;
$$;

create or replace function public.join_trip(p_invite_code text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_trip_id uuid;
begin
  select id into v_trip_id from public.trips where invite_code = p_invite_code;

  if v_trip_id is null then
    raise exception 'invalid invite code';
  end if;

  insert into public.trip_members (trip_id, user_id, role)
  values (v_trip_id, auth.uid(), 'editor')
  on conflict (trip_id, user_id) do nothing;

  return v_trip_id;
end;
$$;

grant execute on function public.get_trip_preview(text) to authenticated;
grant execute on function public.join_trip(text) to authenticated;

-- =========================================================
-- 10. RLS 헬퍼 함수
-- =========================================================
create or replace function public.is_trip_member(p_trip_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.trip_members
    where trip_id = p_trip_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_trip_editor(p_trip_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.trip_members
    where trip_id = p_trip_id and user_id = auth.uid() and role in ('owner', 'editor')
  );
$$;

create or replace function public.is_trip_owner(p_trip_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.trip_members
    where trip_id = p_trip_id and user_id = auth.uid() and role = 'owner'
  );
$$;

create or replace function public.trip_id_of_place(p_place_id uuid)
returns uuid language sql security definer set search_path = public stable as $$
  select trip_id from public.places where id = p_place_id;
$$;

create or replace function public.trip_id_of_itinerary(p_itinerary_id uuid)
returns uuid language sql security definer set search_path = public stable as $$
  select trip_id from public.itineraries where id = p_itinerary_id;
$$;

create or replace function public.trip_id_of_shopping_list(p_shopping_list_id uuid)
returns uuid language sql security definer set search_path = public stable as $$
  select trip_id from public.shopping_lists where id = p_shopping_list_id;
$$;

-- =========================================================
-- 11. RLS 활성화 + 정책
-- =========================================================
alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_members enable row level security;
alter table public.places enable row level security;
alter table public.place_votes enable row level security;
alter table public.itineraries enable row level security;
alter table public.itinerary_places enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.shopping_items enable row level security;
alter table public.activity_logs enable row level security;

-- profiles: 로그인 사용자는 서로의 기본 프로필을 볼 수 있음(닉네임/아바타 표시용), 본인만 수정
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (auth.uid() is not null);
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update
  using (id = auth.uid());

-- trips: 멤버만 조회(+ 본인이 owner인 경우는 trip_members 등록 여부와 무관하게 항상 조회 가능 —
-- INSERT 직후 결과를 돌려받을 때(.select()) SELECT 정책도 통과해야 하는데, 그 시점엔
-- handle_new_trip 트리거가 아직 trip_members에 owner를 추가하기 전일 수 있기 때문),
-- 본인이 owner_id일 때만 생성, owner만 수정/삭제
drop policy if exists trips_select on public.trips;
create policy trips_select on public.trips for select
  using (public.is_trip_member(id) or owner_id = auth.uid());
drop policy if exists trips_insert on public.trips;
create policy trips_insert on public.trips for insert
  with check (owner_id = auth.uid());
drop policy if exists trips_update on public.trips;
create policy trips_update on public.trips for update
  using (public.is_trip_owner(id));
drop policy if exists trips_delete on public.trips;
create policy trips_delete on public.trips for delete
  using (public.is_trip_owner(id));

-- trip_members: 멤버만 조회. insert는 트리거/RPC(SECURITY DEFINER)로만 수행(직접 insert 정책 없음)
drop policy if exists trip_members_select on public.trip_members;
create policy trip_members_select on public.trip_members for select
  using (public.is_trip_member(trip_id));
drop policy if exists trip_members_update on public.trip_members;
create policy trip_members_update on public.trip_members for update
  using (public.is_trip_owner(trip_id));
drop policy if exists trip_members_delete on public.trip_members;
create policy trip_members_delete on public.trip_members for delete
  using (public.is_trip_owner(trip_id) or user_id = auth.uid());

-- places
drop policy if exists places_select on public.places;
create policy places_select on public.places for select
  using (public.is_trip_member(trip_id));
drop policy if exists places_insert on public.places;
create policy places_insert on public.places for insert
  with check (public.is_trip_editor(trip_id) and created_by = auth.uid());
drop policy if exists places_update on public.places;
create policy places_update on public.places for update
  using (public.is_trip_editor(trip_id));
drop policy if exists places_delete on public.places;
create policy places_delete on public.places for delete
  using (public.is_trip_owner(trip_id));

-- place_votes
drop policy if exists place_votes_select on public.place_votes;
create policy place_votes_select on public.place_votes for select
  using (public.is_trip_member(public.trip_id_of_place(place_id)));
drop policy if exists place_votes_insert on public.place_votes;
create policy place_votes_insert on public.place_votes for insert
  with check (public.is_trip_member(public.trip_id_of_place(place_id)) and user_id = auth.uid());
drop policy if exists place_votes_delete on public.place_votes;
create policy place_votes_delete on public.place_votes for delete
  using (user_id = auth.uid());

-- itineraries
drop policy if exists itineraries_select on public.itineraries;
create policy itineraries_select on public.itineraries for select
  using (public.is_trip_member(trip_id));
drop policy if exists itineraries_insert on public.itineraries;
create policy itineraries_insert on public.itineraries for insert
  with check (public.is_trip_editor(trip_id));
drop policy if exists itineraries_update on public.itineraries;
create policy itineraries_update on public.itineraries for update
  using (public.is_trip_editor(trip_id));
drop policy if exists itineraries_delete on public.itineraries;
create policy itineraries_delete on public.itineraries for delete
  using (public.is_trip_editor(trip_id));

-- itinerary_places
drop policy if exists itinerary_places_select on public.itinerary_places;
create policy itinerary_places_select on public.itinerary_places for select
  using (public.is_trip_member(public.trip_id_of_itinerary(itinerary_id)));
drop policy if exists itinerary_places_insert on public.itinerary_places;
create policy itinerary_places_insert on public.itinerary_places for insert
  with check (public.is_trip_editor(public.trip_id_of_itinerary(itinerary_id)));
drop policy if exists itinerary_places_update on public.itinerary_places;
create policy itinerary_places_update on public.itinerary_places for update
  using (public.is_trip_editor(public.trip_id_of_itinerary(itinerary_id)));
drop policy if exists itinerary_places_delete on public.itinerary_places;
create policy itinerary_places_delete on public.itinerary_places for delete
  using (public.is_trip_editor(public.trip_id_of_itinerary(itinerary_id)));

-- shopping_lists
drop policy if exists shopping_lists_select on public.shopping_lists;
create policy shopping_lists_select on public.shopping_lists for select
  using (public.is_trip_member(trip_id));
drop policy if exists shopping_lists_insert on public.shopping_lists;
create policy shopping_lists_insert on public.shopping_lists for insert
  with check (public.is_trip_editor(trip_id));
drop policy if exists shopping_lists_update on public.shopping_lists;
create policy shopping_lists_update on public.shopping_lists for update
  using (public.is_trip_editor(trip_id));
drop policy if exists shopping_lists_delete on public.shopping_lists;
create policy shopping_lists_delete on public.shopping_lists for delete
  using (public.is_trip_editor(trip_id));

-- shopping_items
drop policy if exists shopping_items_select on public.shopping_items;
create policy shopping_items_select on public.shopping_items for select
  using (public.is_trip_member(public.trip_id_of_shopping_list(shopping_list_id)));
drop policy if exists shopping_items_insert on public.shopping_items;
create policy shopping_items_insert on public.shopping_items for insert
  with check (public.is_trip_editor(public.trip_id_of_shopping_list(shopping_list_id)) and created_by = auth.uid());
drop policy if exists shopping_items_update on public.shopping_items;
create policy shopping_items_update on public.shopping_items for update
  using (public.is_trip_editor(public.trip_id_of_shopping_list(shopping_list_id)));
drop policy if exists shopping_items_delete on public.shopping_items;
create policy shopping_items_delete on public.shopping_items for delete
  using (public.is_trip_editor(public.trip_id_of_shopping_list(shopping_list_id)));

-- activity_logs: 멤버만 조회, insert는 트리거(SECURITY DEFINER)로만 수행
drop policy if exists activity_logs_select on public.activity_logs;
create policy activity_logs_select on public.activity_logs for select
  using (public.is_trip_member(trip_id));

-- =========================================================
-- 12. Realtime 발행 (Supabase Realtime이 구독할 테이블)
-- =========================================================
do $$
declare
  t text;
begin
  foreach t in array array[
    'trip_members', 'places', 'place_votes', 'itineraries',
    'itinerary_places', 'shopping_items', 'activity_logs'
  ]
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end;
$$;
