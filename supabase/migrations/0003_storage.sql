-- 쇼핑/버킷리스트 항목에 사진을 첨부할 수 있게 Storage 버킷을 추가한다.
-- 이 파일도 몇 번을 다시 실행해도 안전합니다(idempotent).

insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true)
on conflict (id) do nothing;

drop policy if exists item_images_insert on storage.objects;
create policy item_images_insert on storage.objects for insert
  with check (bucket_id = 'item-images' and auth.uid() is not null);

drop policy if exists item_images_select on storage.objects;
create policy item_images_select on storage.objects for select
  using (bucket_id = 'item-images');

drop policy if exists item_images_delete on storage.objects;
create policy item_images_delete on storage.objects for delete
  using (bucket_id = 'item-images' and auth.uid() is not null);

-- 버킷리스트 항목에도 쇼핑 항목처럼 사진을 첨부할 수 있게 컬럼 추가
alter table public.bucket_list_items add column if not exists image_url text;
