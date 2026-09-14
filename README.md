# 중국 여행 공동 플래너

중국 여행 공동 계획 웹앱. 여행방을 만들고 일행을 초대해서 장소를 저장·투표하고, 날짜별 일정과 쇼핑리스트를 실시간으로 함께 관리합니다.

> 지도는 **고덕지도(AMap)를 우선**으로 사용합니다. 중국 현지에서 VPN 없이도 접속할 수 있습니다. 고덕지도 로드에 실패하면(키 미설정, 네트워크·스크립트 오류 등) 자동으로 **구글맵으로 폴백**합니다. 장소 카드·일정 행의 "지도에서 열기" 링크는 각 장소가 저장될 때 실제로 검색에 사용된 provider(`places.coordinate_system`)에 맞춰 고덕지도/구글맵 중 하나로 연결됩니다.

## 시작하기

### 1. Supabase 프로젝트 준비

1. https://supabase.com/dashboard 에서 새 프로젝트를 만듭니다.
2. 프로젝트의 SQL Editor에서 `supabase/migrations/` 안의 파일들을 **번호 순서대로**(0001, 0002, ...) 실행합니다(전부 재실행해도 안전합니다).
3. Project Settings → API 에서 `Project URL`과 `anon public key`를 복사합니다.
4. Authentication → Providers → Email 에서 **Confirm email**을 꺼주세요. 이 앱은 실제 이메일 없이 아이디(내부적으로 가짜 이메일로 변환)로 가입하기 때문에, 이메일 확인 메일을 받을 수 없습니다.

### 2. 고덕지도(AMap) API 키 준비 (기본 지도)

1. https://console.amap.com/dev/key/app 에서 앱을 만들고 **Web端(JS API)** 타입으로 키를 발급받습니다(실명 인증 필요).
2. 발급된 앱의 상세 화면에서 **보안키(JSCode)**도 함께 확인해 복사해둡니다. 2021년 이후 발급된 키는 JS API 로드 시 이 보안키가 함께 필요합니다.
3. 필요하면 키 설정에서 서비스 도메인(HTTP 리퍼러)을 제한합니다.

### 3. 구글맵 API 키 준비 (폴백 지도)

고덕지도 로드에 실패했을 때 자동으로 사용되는 폴백입니다. 고덕지도 키를 아직 발급받지 못했다면 이 키만으로도 앱이 동작합니다.

1. https://console.cloud.google.com 에서 프로젝트를 만들고 결제 계정을 연결합니다(무료 사용량 제공, 콘솔에서 최신 한도 확인).
2. API 라이브러리에서 **Maps JavaScript API**와 **Places API (New)**를 사용 설정합니다.
3. 사용자 인증 정보에서 API 키를 발급받고, 필요하면 HTTP 리퍼러로 도메인을 제한합니다.

### 4. 환경 변수 설정

`.env.local` 파일에 아래 값을 채워주세요 (`.env.local.example` 참고):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_AMAP_KEY=
NEXT_PUBLIC_AMAP_SECURITY_CODE=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

### 5. 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인합니다.

### 6. Vercel 배포

1. https://vercel.com 에서 GitHub 계정으로 로그인하고, 이 저장소를 Import 합니다.
2. Project Settings → Environment Variables 에 `.env.local`과 동일한 5개 값(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_AMAP_KEY`, `NEXT_PUBLIC_AMAP_SECURITY_CODE`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`)을 등록합니다.
3. Deploy를 누르면 끝입니다. 이후 `main` 브랜치에 push할 때마다 자동으로 재배포됩니다.
4. 기본 지도인 고덕지도 키를 도메인으로 제한했다면, Vercel이 준 도메인(`*.vercel.app`)도 허용 목록에 추가해주세요. 폴백용 구글맵 키를 HTTP 리퍼러로 제한한 경우에도 같은 도메인을 함께 추가해야 폴백이 정상 동작합니다.

## 로그인 방식

이메일 없이 **아이디/비밀번호**로만 가입·로그인합니다. 내부적으로는 Supabase Auth가 이메일 형식을 요구하기 때문에 아이디를 `아이디@users.china-trip-planner.local` 형태의 가짜 이메일로 변환해서 저장합니다(`app/login/actions.ts`). 실제 메일이 발송되지 않으므로 Supabase 프로젝트의 이메일 확인(Confirm email)을 반드시 꺼야 합니다.

## 기능 (MVP)

- 여행방 생성/초대/권한(방장·편집자·조회자)
- 지도 검색(고덕지도 우선 + 구글맵 폴백)으로 장소 저장, 투표, 필터/정렬, 소프트 삭제·복구
- 날짜별 일정 보드(드래그 정렬), 지도 표시, 지도 딥링크(장소별 좌표계에 맞춰 고덕지도/구글맵 선택)
- 공동 쇼핑리스트(담당자·수량·가격·상태)
- 공동 버킷리스트(연락 방법·연락처·가격·예약 시간·상태)
- 실시간 동기화(Supabase Realtime) + 활동 로그

## 다음 단계 (2단계 백로그)

- 자동 경로 최적화, 일정 충돌 자동 경고
- 지역 자동 클러스터링, 쇼핑-지도 자동 연결
- 비용 정산
