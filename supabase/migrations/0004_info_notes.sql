-- 기타 정보(꿀팁, 참고 링크 등)를 자유롭게 기록하는 공동 메모판.
-- 이 파일도 몇 번을 다시 실행해도 안전합니다(idempotent).

create table if not exists public.info_notes (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  title text not null,
  url text,
  content text,
  category text, -- 예: 교통, 통신, 환전, 안전, 링크, 꿀팁, 기타 (자유 입력)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists info_notes_set_updated_at on public.info_notes;
create trigger info_notes_set_updated_at before update on public.info_notes
  for each row execute function public.set_updated_at();

-- activity_logs에 info_notes 분기 추가
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
  elsif tg_table_name = 'info_notes' then
    v_trip_id := v_row.trip_id;
  end if;

  insert into public.activity_logs (trip_id, user_id, action_type, entity_type, entity_id)
  values (v_trip_id, auth.uid(), lower(tg_op), tg_table_name, v_row.id);

  return v_row;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists info_notes_log_activity on public.info_notes;
create trigger info_notes_log_activity after insert or update or delete on public.info_notes
  for each row execute function public.log_activity();

-- RLS
alter table public.info_notes enable row level security;

drop policy if exists info_notes_select on public.info_notes;
create policy info_notes_select on public.info_notes for select
  using (public.is_trip_member(trip_id));
drop policy if exists info_notes_insert on public.info_notes;
create policy info_notes_insert on public.info_notes for insert
  with check (public.is_trip_editor(trip_id) and created_by = auth.uid());
drop policy if exists info_notes_update on public.info_notes;
create policy info_notes_update on public.info_notes for update
  using (public.is_trip_editor(trip_id));
drop policy if exists info_notes_delete on public.info_notes;
create policy info_notes_delete on public.info_notes for delete
  using (public.is_trip_editor(trip_id));

-- Realtime
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'info_notes'
  ) then
    execute 'alter publication supabase_realtime add table public.info_notes';
  end if;
end;
$$;
