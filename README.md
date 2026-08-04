# 중국 여행 공동 플래너

고덕지도(AMap) 기반 중국 여행 공동 계획 웹앱. 여행방을 만들고 일행을 초대해서 장소를 저장·투표하고, 날짜별 일정과 쇼핑리스트를 실시간으로 함께 관리합니다.

## 시작하기

### 1. Supabase 프로젝트 준비

1. https://supabase.com/dashboard 에서 새 프로젝트를 만듭니다.
2. 프로젝트의 SQL Editor에서 `supabase/migrations/0001_init.sql` 내용을 실행합니다.
3. Project Settings → API 에서 `Project URL`과 `anon public key`를 복사합니다.

### 2. 고덕지도(AMap) 키 준비

1. https://console.amap.com 에서 앱을 등록하고 **JS API 2.0** 키를 발급받습니다.
2. 2021년 12월 이후 발급 키는 **보안 코드(안전密钥/jscode)**가 함께 필요합니다. 콘솔에서 같이 확인하세요.

### 3. 환경 변수 설정

`.env.local` 파일에 아래 값을 채워주세요 (`.env.local.example` 참고):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_AMAP_KEY=
NEXT_PUBLIC_AMAP_SECURITY_CODE=
```

### 4. 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인합니다.

## 기능 (MVP)

- 여행방 생성/초대/권한(방장·편집자·조회자)
- 고덕지도 검색으로 장소 저장, 투표, 필터/정렬, 소프트 삭제·복구
- 날짜별 일정 보드(드래그 정렬), 지도 표시, 고덕지도 앱 딥링크
- 공동 쇼핑리스트(담당자·수량·가격·상태)
- 실시간 동기화(Supabase Realtime) + 활동 로그

## 다음 단계 (2단계 백로그)

- 자동 경로 최적화, 일정 충돌 자동 경고
- 지역 자동 클러스터링, 쇼핑-지도 자동 연결
- 비용 정산
