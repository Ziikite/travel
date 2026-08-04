# 중국 여행 공동 플래너

중국 여행 공동 계획 웹앱. 여행방을 만들고 일행을 초대해서 장소를 저장·투표하고, 날짜별 일정과 쇼핑리스트를 실시간으로 함께 관리합니다.

> 지도는 현재 **구글맵**을 사용합니다(중국 현지에서는 VPN 등으로 접속 필요). 고덕지도(AMap) 키를 발급받을 수 있게 되면 `lib/maps.ts`와 이를 가져다 쓰는 `places/PlaceSearchDialog.tsx`, `itinerary/TripMap.tsx`, `itinerary/ItineraryItemRow.tsx`를 고덕지도 버전으로 되돌리면 됩니다(git 히스토리의 "Add AMap-based MVP" 커밋 참고).

## 시작하기

### 1. Supabase 프로젝트 준비

1. https://supabase.com/dashboard 에서 새 프로젝트를 만듭니다.
2. 프로젝트의 SQL Editor에서 `supabase/migrations/0001_init.sql` 내용을 실행합니다.
3. Project Settings → API 에서 `Project URL`과 `anon public key`를 복사합니다.

### 2. 구글맵 API 키 준비

1. https://console.cloud.google.com 에서 프로젝트를 만들고 결제 계정을 연결합니다(무료 사용량 제공, 콘솔에서 최신 한도 확인).
2. API 라이브러리에서 **Maps JavaScript API**와 **Places API (New)**를 사용 설정합니다.
3. 사용자 인증 정보에서 API 키를 발급받고, 필요하면 HTTP 리퍼러로 도메인을 제한합니다.

### 3. 환경 변수 설정

`.env.local` 파일에 아래 값을 채워주세요 (`.env.local.example` 참고):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

### 4. 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인합니다.

## 기능 (MVP)

- 여행방 생성/초대/권한(방장·편집자·조회자)
- 구글맵 검색으로 장소 저장, 투표, 필터/정렬, 소프트 삭제·복구
- 날짜별 일정 보드(드래그 정렬), 지도 표시, 구글맵 딥링크
- 공동 쇼핑리스트(담당자·수량·가격·상태)
- 실시간 동기화(Supabase Realtime) + 활동 로그

## 다음 단계 (2단계 백로그)

- 자동 경로 최적화, 일정 충돌 자동 경고
- 지역 자동 클러스터링, 쇼핑-지도 자동 연결
- 비용 정산
- (여권/AMap 키 준비되면) 고덕지도로 재전환
