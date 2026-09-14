-- 장소에 고덕지도(AMap) 공유 링크를 직접 붙여넣을 수 있게 한다.
-- 검색으로 좌표를 못 찾았거나, 고덕지도 앱에서 공유한 링크를 그대로 쓰고 싶을 때를 위한 값이다.
-- 이 파일도 몇 번을 다시 실행해도 안전합니다(idempotent).

alter table public.places add column if not exists amap_url text;
