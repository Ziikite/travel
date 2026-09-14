# 중국 여행 공동 플래너 Design System

<!-- design-md:section experience -->
## 1. Experience

<!-- design-md:claim scope kind=product-surface lang=en -->
### Scope

중국으로 가는 단체 여행을 여러 사람이 함께 계획하는 웹앱의 디자인 시스템이다. 여행을 만들고 초대 코드로 동행을 모아, 지도에서 장소를 찾아 저장·투표하고, 날짜별 일정을 함께 짜고, 쇼핑과 버킷 리스트를 나눠 관리한다. 화면의 모든 문장은 한국어이고, 변경은 Supabase Realtime으로 다른 사람 화면에 바로 반영된다.
<!-- design-md:claim-end -->

<!-- design-md:claim primary-tasks kind=user-outcomes count=5 lang=en -->
### Primary tasks

- 여행을 만들고 초대 코드로 동행을 불러들인다.

- 지도에서 장소를 검색해 저장하고, 우선순위와 투표로 갈 곳을 좁힌다.

- 저장한 장소를 날짜별 일정으로 끌어 놓아 하루 동선을 만든다.

- 쇼핑리스트와 버킷리스트에 항목을 올리고 담당자와 구매 상태를 나눠 관리한다.

- 설정에서 멤버 권한(owner / editor / viewer)과 활동 기록을 확인한다.
<!-- design-md:claim-end -->

### Design direction

- 흰 바탕, 1px 회색 경계선, 하나의 파란 액션색으로 화면을 만든다. 장식 요소는 넣지 않는다.

- 파란색 primary는 한 화면에 한 번, 그 화면에서 가장 중요한 동작에만 쓴다. 나머지 동작은 회색 경계선이나 텍스트만 쓴다.

- 정보 밀도를 낮춘다. 한 카드에 담는 보조 정보 줄 수를 제한하고, 묶음은 선 대신 여백으로 나눈다.

- 상태는 색과 한국어 라벨을 함께 써서 전달한다.

### Principles

- 같은 데이터를 여러 사람이 동시에 고친다. 화면은 항상 방금 바뀐 값을 보여주고, 누가 등록했는지 남긴다.

- 권한에 따라 할 수 있는 동작이 다르다. 할 수 없는 동작은 비활성으로 남기지 않고 화면에서 뺀다.

- 여행 중에는 좁은 화면이 기본값이다. 320px에서 가로 스크롤 없이 동작해야 한다.

- 한국어가 기준 언어다. 중국 지명은 중국어 원문과 한국어 표기를 나란히 보여준다.

### Avoid

- 레퍼런스 toss의 마케팅 표면 값(#e8f3ff 약한 CTA, 7px 반경, 36px 제목)을 제품 화면에 가져오지 않는다. 가져온 것은 제품 표면에서 확인된 값뿐이다.

- 그라데이션, 넓게 퍼지는 그림자, 장식용 아이콘 타일을 쓰지 않는다.

- 색만으로 상태를 구분하지 않는다. 구매완료·품절·보류에는 항상 한국어 라벨을 붙인다.

- 다크 모드 스타일을 새로 추가하지 않는다. 이 앱은 라이트 모드로 고정되어 있다.

<!-- design-md:section foundations -->
## 2. Foundations

<!-- design-md:claim foundations kind=rules-or-constraints lang=en -->
### Semantic tokens

- **color.border**: `#e5e8eb` — 카드·입력·구분선의 1px 경계선
- **color.canvas**: `#ffffff` — 기본 배경. app/globals.css의 --background
- **color.danger**: `#e42939` — 삭제 동작과 실패 알림. 흰 글자와 4.49:1
- **color.ink**: `#191f28` — 본문과 제목 글자색. 흰 바탕과 16.6:1. app/globals.css의 --foreground를 이 값으로 맞춘다
- **color.ink-muted**: `#4e5968` — 보조 설명 글자색. 흰 바탕과 7.1:1, surface-sunken과 6.5:1
- **color.on-primary**: `#ffffff` — primary 및 danger 배경 위 글자색
- **color.primary**: `#3182f6` — 주요 동작 한 개에만 쓰는 파란색. 흰 글자와 3.71:1 — 비텍스트 UI 기준 3:1은 넘지만 본문 기준 4.5:1에는 못 미친다
- **color.primary-hover**: `#2272eb` — primary 동작의 hover / pressed 배경. 흰 글자와 4.49:1
- **color.success**: `#047857` — 구매완료처럼 끝난 상태. 흰 글자와 5.48:1
- **color.surface-sunken**: `#f2f4f6` — 상태 칩과 세그먼트 컨트롤의 바탕
- **focus.ring**: `2px solid #3182f6 with 2px offset` — 키보드 포커스 표시. 모든 상호작용 요소에 보이게 남긴다
- **radius.card**: `12px` — 장소 카드와 목록 줄
- **radius.control**: `8px` — 버튼, 입력, 토스트
- **radius.dialog**: `16px` — 다이얼로그와 로그인 패널
- **space.card-padding**: `16px` — 카드와 목록 줄 안쪽 여백
- **space.dialog-padding**: `24px` — 다이얼로그 안쪽 여백
- **space.stack-gap**: `8px` — 같은 묶음 안 요소 사이 간격

### Contrast pairs

- color.on-primary on color.primary: minimum 3:1
- color.on-primary on color.danger: minimum 4.4:1
- color.on-primary on color.success: minimum 4.5:1
- color.ink on color.canvas: minimum 7:1
- color.ink-muted on color.canvas: minimum 4.5:1
- color.ink on color.surface-sunken: minimum 7:1
- color.ink-muted on color.surface-sunken: minimum 4.5:1
- color.primary on color.canvas: minimum 3:1

### Reduced motion

Required.

### Foundation rules

- color.primary는 한 화면에 한 번만 쓴다. 두 번째 동작부터는 color.border 경계선이나 텍스트 버튼으로 낮춘다.

- 흰 글자를 얹은 color.primary 배경은 3.71:1이다. WCAG AA 비텍스트 UI 기준 3:1은 넘지만 본문 텍스트 기준 4.5:1에는 못 미친다. 채움형 primary 버튼의 레이블은 body-strong(16px / 600) 이상으로 쓰고, hover와 pressed에서는 4.49:1인 color.primary-hover로 어둡게 한다.

- 모든 상호작용 요소는 focus.ring을 보이게 남긴다. outline을 지우고 대체 표시를 두지 않는 코드는 금지한다.

- 경계선은 color.border 1px만 쓴다. 그림자는 다이얼로그와 토스트에만 허용한다.

- 반경은 radius.control · radius.card · radius.dialog 세 단계만 쓴다.

- 여백은 space.stack-gap 8px · space.card-padding 16px · space.dialog-padding 24px 세 단계만 쓴다. 이 값들은 toss가 공개한 4 / 6 / 8 / 16 / 24 / 32 척도 위에 있다.

- 라이트 모드 고정이다. app/globals.css의 @custom-variant dark 선언이 dark: 유틸리티를 무력화하므로 새 dark: 클래스를 추가하지 않는다.

- 색만으로 의미를 전달하지 않는다. 상태는 색과 한국어 라벨을 함께 쓴다.
<!-- design-md:claim-end -->

<!-- design-md:section typography-assets -->
## 3. Typography & Assets

### Type roles

| Role | Usage | Family | Size | Weight | Line height | Tracking |
|---|---|---|---|---|---|---|
| page-title | 화면 제목 — 여행 제목, 목록 제목 | Geist, system-ui, sans-serif | 22px | 700 | 1.5 |  |
| section-title | 다이얼로그 제목과 섹션 제목 | Geist, system-ui, sans-serif | 18px | 600 | 1.5 |  |
| body | 본문, 주소, 메모 | Geist, system-ui, sans-serif | 16px | 400 | 1.5 |  |
| body-strong | 카드와 목록 줄의 항목 이름, 채움형 버튼 레이블 | Geist, system-ui, sans-serif | 16px | 600 | 1.5 |  |
| caption | 보조 설명, 등록자 줄, 상태 칩 라벨 | Geist, system-ui, sans-serif | 14px | 400 | 1.5 |  |
| numeric | 가격, 수량, 체류 시간처럼 자릿수를 비교하는 숫자 | Geist Mono, ui-monospace, monospace | 16px | 400 | 1.5 | 0 |

### Rules

- UI 텍스트는 --font-geist-sans(Geist)를 쓴다. Geist와 Geist Mono는 app/layout.tsx가 next/font/google로 로드해 CSS 변수로 주입한다. 레퍼런스 toss의 Toss Product Sans는 이 저장소에 로드돼 있지 않고 공개 재배포 권리도 공표되지 않아 쓰지 않는다.

- 여섯 역할 모두 줄높이 1.5를 쓴다. 크기는 toss가 공개한 Body 16 / Body Small 14 / H4 22 단계를 이 앱의 밀도에 맞춰 가져온 것이고, H1 36과 H2 30 같은 큰 단계는 가져오지 않는다.

- 폰트 라이선스 원문을 확인하기 전까지 프로젝트 소유 에셋 목록은 비워 둔다. 로고, 아이콘, 이미지도 확인된 것만 올린다.

- app/globals.css의 body font-family가 아직 Arial/Helvetica로 선언돼 있어 로드된 Geist와 어긋난다. 화면을 손볼 때 이 선언을 함께 정리한다.

- 가격과 수량처럼 자릿수를 비교하는 숫자는 numeric 역할과 font-variant-numeric: tabular-nums를 함께 쓴다.

- 타입 단계는 위 여섯 개만 쓴다. 필요할 때 새 크기를 즉석에서 만들지 않는다.

- 중국어 지명은 한국어 표기와 나란히 보여주고, 중국어 문자열에 한국어용 자간 조정을 적용하지 않는다.

<!-- design-md:section components-states -->
## 4. Components & States

### Component: action-button

**Semantics:** 폼 제출과 상태 변경을 일으키는 기본 동작 요소. 레이블은 무엇을 하는지 동사로 쓴다 — 저장, 닫기, 삭제, 초대 링크 복사.

- Anatomy: 한국어 동사 레이블, radius.control 배경 또는 1px 경계선, 진행 중 표시 자리, focus.ring
- Variants: primary — 화면에서 가장 중요한 동작 하나, quiet — 닫기, 취소 같은 보조 동작, danger — 삭제
- States: default, hover, focus-visible, disabled, loading
- Token references: color.primary, color.primary-hover, color.on-primary, color.border, color.ink, color.danger, radius.control, focus.ring

- Interaction kind: interactive

#### State applicability

| State | Applicability | Reason |
|---|---|---|
| default | applicable |  |
| hover | applicable |  |
| focus-visible | applicable |  |
| disabled | applicable |  |
| loading | applicable |  |
| error | not-applicable | 제출 실패는 버튼이 아니라 toast-notification의 error 변형으로 알린다. |
| success | not-applicable | 성공도 toast-notification으로 알리고, 버튼은 원래 레이블로 돌아간다. |

### Component: text-field

**Semantics:** 한 줄 값을 입력받는 요소. required, pattern, minLength 같은 브라우저 제약을 먼저 쓰고, 실패 문구는 필드 바로 아래에 한국어로 붙인다.

- Anatomy: 레이블 또는 placeholder, 1px 경계선 입력 영역, 필드 아래 도움말 또는 오류 문구
- Variants: text — 이름, 메모, number — 수량, 가격, password — 비밀번호, select — 담당자, 권한, 우선순위
- States: default, hover, focus-visible, disabled, error
- Token references: color.canvas, color.border, color.ink, color.ink-muted, color.danger, radius.control, focus.ring

- Interaction kind: interactive

#### State applicability

| State | Applicability | Reason |
|---|---|---|
| default | applicable |  |
| hover | applicable |  |
| focus-visible | applicable |  |
| disabled | applicable |  |
| loading | not-applicable | 입력값은 제출 시점에만 서버로 보낸다. 필드 자체가 데이터를 기다리지 않는다. |
| error | applicable |  |
| success | not-applicable | 저장 성공은 목록 갱신과 toast-notification으로 보여준다. 필드에 성공 표시를 넣지 않는다. |

### Component: place-card

**Semantics:** 여행에 저장된 장소 한 건. 카드 전체를 누르면 detail-dialog가 열리고, 안쪽 투표 버튼은 카드 열기와 분리해 동작한다.

- Anatomy: 중국어 장소명과 괄호 안 한국어 표기, 중국어 주소, 투표 버튼과 득표 수, 우선순위와 분류 status-chip 묶음, 메모 한 줄, 등록자 줄
- Variants: active — 투표와 편집 동작이 보인다, deleted — 투표와 편집 동작을 감춘다
- States: default, hover, focus-visible, loading
- Token references: color.canvas, color.border, color.ink, color.ink-muted, radius.card, space.card-padding, focus.ring

- Interaction kind: interactive

#### State applicability

| State | Applicability | Reason |
|---|---|---|
| default | applicable |  |
| hover | applicable |  |
| focus-visible | applicable |  |
| disabled | not-applicable | 권한이 없는 멤버에게는 편집 동작을 비활성으로 남기지 않고 감춘다. 카드 자체는 모든 멤버가 열 수 있다. |
| loading | applicable |  |
| error | not-applicable | 투표와 저장 실패는 toast-notification으로 알린다. 카드 안에 오류 영역을 만들지 않는다. |
| success | not-applicable | 성공은 실시간으로 갱신된 득표 수와 목록으로 드러난다. |

### Component: list-item-row

**Semantics:** 쇼핑리스트, 버킷리스트, 일정 목록의 한 줄. 자주 쓰는 상태 변경은 줄 안에서 끝내고, 자세한 내용은 detail-dialog에서 본다.

- Anatomy: 항목 이름과 중국어 표기, status-chip, 담당자, 수량, 가격 보조 줄, 순서 변경 손잡이, 한 줄에서 쓰는 상태 변경 동작
- Variants: shopping — 구매 상태와 위안 가격, bucket — 완료 여부, itinerary — 순서 변경 손잡이와 시간
- States: default, hover, focus-visible, loading
- Token references: color.canvas, color.border, color.ink, color.ink-muted, radius.card, space.card-padding, space.stack-gap, focus.ring

- Interaction kind: interactive

#### State applicability

| State | Applicability | Reason |
|---|---|---|
| default | applicable |  |
| hover | applicable |  |
| focus-visible | applicable |  |
| disabled | not-applicable | viewer 권한에게는 상태 변경 동작을 비활성으로 남기지 않고 감춘다. |
| loading | applicable |  |
| error | not-applicable | 저장 실패는 toast-notification으로 알린다. |
| success | not-applicable | 성공은 status-chip 값이 바뀌는 것으로 드러난다. |

### Component: detail-dialog

**Semantics:** 네이티브 dialog 요소를 showModal로 띄운다. 열리면 첫 포커스를 다이얼로그 안으로 옮기고, Esc와 닫기 버튼 둘 다로 닫을 수 있어야 한다.

- Anatomy: 제목과 보조 제목, 닫기 버튼, 레이블과 값 정의 목록, 구분선 위 하단 동작 줄, 반투명 backdrop
- Variants: read — 값만 보여준다, edit — 입력 폼으로 바꾼다
- States: default, focus-visible, loading
- Token references: color.canvas, color.border, color.ink, color.ink-muted, radius.dialog, space.dialog-padding, focus.ring

- Interaction kind: interactive

#### State applicability

| State | Applicability | Reason |
|---|---|---|
| default | applicable |  |
| hover | not-applicable | 다이얼로그 컨테이너 자체는 hover에 반응하지 않는다. 안쪽 action-button이 담당한다. |
| focus-visible | applicable |  |
| disabled | not-applicable | 다이얼로그는 열려 있거나 닫혀 있다. 비활성이라는 중간 상태가 없다. |
| loading | applicable |  |
| error | not-applicable | 저장 실패는 toast-notification으로 알린다. 개별 필드 오류는 text-field의 error가 담당한다. |
| success | not-applicable | 성공하면 다이얼로그를 닫는다. 안에 성공 화면을 만들지 않는다. |

### Component: trip-tab-nav

**Semantics:** 여행 안의 여섯 화면(장소, 일정, 쇼핑리스트, 버킷리스트, 기타 정보, 설정)을 오가는 탭. 현재 탭은 color.primary 밑줄과 진한 잉크색으로 표시한다.

- Anatomy: 여행 제목, 목적지와 기간 보조 줄, 가로로 스크롤되는 탭 묶음, 현재 탭 밑줄
- States: default, hover, focus-visible
- Token references: color.ink, color.ink-muted, color.border, color.primary, focus.ring

- Interaction kind: interactive

#### State applicability

| State | Applicability | Reason |
|---|---|---|
| default | applicable |  |
| hover | applicable |  |
| focus-visible | applicable |  |
| disabled | not-applicable | 모든 멤버가 여섯 화면을 읽을 수 있다. 권한 차이는 화면 안 동작에서만 갈린다. |
| loading | not-applicable | 탭은 클라이언트 라우팅 링크다. 로딩 표시는 이동한 화면이 담당한다. |
| error | not-applicable | 이동 실패는 탭이 아니라 해당 화면이 알린다. |
| success | not-applicable | 이동 결과는 현재 탭 표시가 바뀌는 것으로 드러난다. |

### Component: status-chip

**Semantics:** 장소나 항목의 현재 값을 읽기 위한 표시. 색은 보조 신호일 뿐이고 한국어 라벨이 항상 함께 있어야 한다.

- Anatomy: 둥근 배경, 한국어 상태 라벨
- Variants: 우선순위 — 꼭 가기 / 가고 싶음 / 선택, 구매 상태 — 미구매 / 구매완료 / 품절 / 보류, 분류 — 지도가 준 장소 분류 첫 항목
- States: default
- Token references: color.surface-sunken, color.ink-muted, color.success, color.danger, radius.control

- Interaction kind: non-interactive
- Interaction reason: 값을 읽는 표시일 뿐 누를 수 없다. 상태 변경은 list-item-row와 detail-dialog의 동작이 담당한다.

### Component: toast-notification

**Semantics:** 서버 저장 결과를 알린다. 3초 뒤 스스로 사라지므로 되돌릴 수 없는 결정을 여기에 담지 않고, 실패 메시지에는 무엇이 실패했는지와 원인을 함께 쓴다.

- Anatomy: 화면 하단 중앙 고정 배치, 한 줄 한국어 메시지, 변형별 배경색
- Variants: default — 완료 알림, error — 실패 사유
- States: default, error
- Token references: color.ink, color.on-primary, color.danger, radius.control

- Interaction kind: non-interactive
- Interaction reason: 3초 뒤 자동으로 사라지는 알림이다. 포커스를 가져가지 않고 누를 수 있는 부분도 없다.

### Rules

- 상호작용 컴포넌트는 focus.ring을 보이게 남긴다. 마우스 전용 hover 효과로 대체하지 않는다.

- 권한이 없는 동작은 disabled로 남기지 않고 렌더에서 제외한다. owner와 editor만 편집 동작을 본다.

- 실패와 완료 알림은 toast-notification 한 곳으로 모은다. 컴포넌트마다 따로 오류 영역을 만들지 않는다. 예외는 필드 단위 입력 오류를 보여주는 text-field의 error뿐이다.

- toast-notification은 aria-live 영역으로 읽히게 해서 화면을 보지 않는 사용자에게도 결과가 전달되게 한다.

- 손으로 누르는 대상은 최소 44x44px를 확보한다. 투표 버튼처럼 작은 요소는 여백으로 넓힌다.

- 목록 한 줄이나 카드 한 장에는 보조 정보를 세 줄까지만 둔다. 그 이상은 detail-dialog로 옮긴다.

- 새 컴포넌트를 추가할 때는 default, hover, focus-visible, disabled, loading, error, success 일곱 상태의 적용 여부를 모두 적는다.

<!-- design-md:section layout-platforms -->
## 5. Layout & Platforms

### Responsive constraints

- Minimum supported width: 320px
- Reflow target: 200% zoom

### Layout rules

- 본문 컨테이너는 최대 1024px 폭 안에서 좌우 24px 여백을 유지한다.

- 320px에서 가로 스크롤이 생기면 안 된다. app/globals.css가 body overflow-x: hidden과 전역 min-width: 0으로 증상을 막고 있으므로, 넘치는 원인은 레이아웃에서 고친다.

- 탭 묶음처럼 넘칠 수밖에 없는 가로 줄만 자기 자신에게 overflow-x: auto를 갖는다.

- 다이얼로그는 최대 448px 폭으로 두고, 좁은 화면에서는 좌우 여백을 남긴 채 화면 폭을 채운다.

- 좁은 화면에서 목록은 한 열로 쌓는다. 두 열 이상은 768px 이상에서만 쓴다.

### Platform: web

- Next.js App Router 서버 컴포넌트가 첫 데이터를 그린다. 상호작용이 필요한 조각만 클라이언트 컴포넌트로 떼어낸다.
- 폼은 Server Action을 action 속성으로 넘겨 제출한다. 클라이언트 fetch로 바꾸지 않는다.
- 라이트 모드 고정이므로 prefers-color-scheme 분기를 추가하지 않는다.
- prefers-reduced-motion: reduce에서는 위치 이동과 크기 변화를 없애고 색 변화만 남긴다.

<!-- design-md:section content-locales -->
## 6. Content & Locales

### Voice

- 짧고 사실적인 한국어 문장을 쓴다. 한 문장에 한 가지만 말한다.

- 동작 레이블은 동사로 끝낸다 — 저장, 닫기, 초대 링크 복사.

- 실패 문구는 무엇이 실패했는지 먼저 쓰고 원인을 뒤에 붙인다.

- 기능을 홍보하는 표현을 쓰지 않는다. 여행 준비에 필요한 정보만 쓴다.

- 감탄사를 넣지 않는다. 이미 쓰이는 것 말고 새 이모지에 의미를 실어 쓰지 않는다.

### Terminology

| Term | Preferred form |
|---|---|
| 권한 | owner / editor / viewer 세 단계. 코드와 UI에서 같은 이름을 쓴다. |
| 버킷리스트 | 여행에서 해보고 싶은 일 목록. |
| 쇼핑리스트 | 중국에서 살 물건 목록. 위시리스트로 쓰지 않는다. |
| 여행 | 하나의 여행 계획 단위. 룸이나 프로젝트로 부르지 않는다. |
| 일정 | 날짜별 방문 순서. 스케줄로 쓰지 않는다. |
| 장소 | 지도에서 저장한 한 곳. 핀이나 스팟으로 부르지 않는다. |
| 초대 코드 | 여행에 합류하기 위한 코드. 코드를 담은 주소는 초대 링크라고 구분해 쓴다. |

### Locale: ko (supported)

- UI 문장 전체가 한국어다. 새로 넣는 문구도 한국어로 쓴다.
- html lang 속성은 ko를 유지한다.
- 날짜는 YYYY-MM-DD 형식 그대로 보여준다.
- 금액은 위안(CNY) 기준으로 쓰고 단위를 글자로 붙인다.

### Locale: zh-CN (partial)

- 장소명과 주소는 지도가 준 중국어 원문을 그대로 보여주고 번역하지 않는다.
- 중국어 원문 옆에 한국어 표기가 있으면 괄호로 함께 보여준다.
- 버튼, 안내, 오류 같은 UI 문장은 중국어로 제공하지 않는다. 현재 사용 대상은 한국어 사용자뿐이다.

<!-- design-md:section governance -->
## 7. Governance

<!-- design-md:claim authority kind=project-system lang=en -->
### Authority

This document is the project design contract for the declared scope.
<!-- design-md:claim-end -->

<!-- design-md:claim application-priority order=prompt-fact,repository-fact,system-contract,reference-inspiration lang=en -->
### Application priority

1. Direct user instructions for the requested scope.
2. Repository facts.
3. This system contract.
4. Reference inspiration.
<!-- design-md:claim-end -->

<!-- design-md:claim unknowns policy=absent-at-smallest-unresolved-boundary lang=en -->
### Unknowns

Omit only the smallest unresolved value or group. Do not replace it with a plausible default.
<!-- design-md:claim-end -->

<!-- design-md:claim changes policy=review-record-validate-before-adoption lang=en -->
### Changes

Record, review, and validate changes before adoption.
<!-- design-md:claim-end -->

### Project priority details

1. 이 문서가 저장소의 시각 결정 기준이다. 코드와 어긋나면 코드를 이 문서에 맞춘다.

2. 코드에서 확인되는 사실(app/globals.css, app/layout.tsx, 컴포넌트 클래스)이 제안보다 먼저다.

3. 여기 없는 값은 새로 만들지 말고 결정을 요청한다.

### Additional change rules

- 토큰이나 컴포넌트를 바꿀 때는 graph draft를 고쳐 다시 compile한다. DESIGN.md를 직접 손대지 않는다.

- 레퍼런스에서 값을 가져올 때는 그 값이 어느 표면에서 관측된 것인지 함께 적는다.

- 사용자 확인이 필요한 브랜드 서술은 확인을 받기 전까지 문서에 넣지 않는다.

### Decision provenance

- /foundations/tokens/color.primary/$value — prompt-fact; value: "#3182f6"; evidence: 사용자 지시: 토스 디자인 가이드를 그대로 적용해 달라 — 색 방향만 빌리던 이전 결정을 대체한다, 기반 레퍼런스: .claude/data/references/toss/DESIGN.md tokens.colors.primary #3182f6 (TDS Mobile 버튼 표면, 2026-07-11 확인), WCAG 상대휘도로 계산한 흰 글자 대비는 3.71:1이다. 비텍스트 UI 기준 3:1은 넘지만 본문 텍스트 기준 4.5:1에는 못 미친다, 이 문서가 이전에 선언한 on-primary/primary 최소값 4.5:1을 실측값이 넘지 못하므로, 거짓 비율을 적는 대신 최소값을 3:1로 낮추고 실측값을 함께 남겼다, 4.5:1을 지키려면 toss가 마케팅 표면에서 확인한 더 어두운 파랑 #1b64da(5.41:1)로 바꿔야 하지만, 제품 표면 값이 아니고 토스의 알아볼 수 있는 파랑을 잃어 채택하지 않았다
- /foundations/tokens/color.primary-hover/$value — prompt-fact; value: "#2272eb"; evidence: .claude/data/references/toss/DESIGN.md tokens.colors.primary-hover #2272eb (TDS Mobile 버튼 표면, 2026-07-11 확인), 흰 글자 대비 실측 4.49:1 — 4.5:1에 0.01 못 미친다. hover와 pressed에서만 쓰는 배경이라 기본 상태보다 대비가 높아지는 방향은 유지된다
- /foundations/tokens/color.danger/$value — prompt-fact; value: "#e42939"; evidence: .claude/data/references/toss/DESIGN.md tokens.colors.danger #e42939 (TDS Mobile 버튼 표면, 2026-07-11 확인), 흰 글자 대비 실측 4.49:1로 4.5:1에 0.01 못 미쳐 선언 최소값을 4.4:1로 적었다, 저장소가 쓰던 #dc2626은 4.83:1로 기준을 넘지만, 토스 가이드를 그대로 적용하라는 지시를 따라 교체했다. 기준을 우선하려면 #dc2626으로 되돌리면 된다
- /foundations/tokens/color.ink-muted/$value — prompt-fact; value: "#4e5968"; evidence: .claude/data/references/toss/DESIGN.md tokens.colors.body #4e5968 (toss.im 제품 표면, 2026-07-11 확인), toss의 muted #8b95a1은 흰 바탕과 3.04:1, surface-sunken과 2.76:1로 이 앱이 지키는 4.5:1을 넘지 못한다 — 보조 설명과 상태 칩 라벨이 14px 이하라서 채택할 수 없었다, #4e5968은 흰 바탕과 7.11:1, surface-sunken과 6.45:1로 두 자리 모두에서 기준을 넘는다
- /foundations/tokens/color.success/$value — agent-proposed-greenfield-decision; value: "#047857"; evidence: toss 레퍼런스에는 성공 계열 토큰이 없다 — 확인된 색은 primary와 danger뿐이다, 이 앱에는 구매완료와 버킷 완료라는 실제 종료 상태가 있어 토큰이 필요하다, 레퍼런스에 근거가 없으므로 이전 그래프의 값 #047857을 그대로 이어 쓴다. 흰 글자와 5.48:1로 기준을 넘는다
- /typography_assets/roles — prompt-fact; evidence: 패밀리는 Geist를 유지한다 — app/layout.tsx가 next/font/google로 Geist와 Geist Mono를 로드하는 저장소 사실이 레퍼런스 선호보다 앞선다, toss의 Toss Product Sans는 이 저장소에 로드돼 있지 않고 레퍼런스 스스로 공개 재배포 권리가 없다고 적고 있어 가져오지 않았다, 크기와 무게와 줄높이는 toss가 공개한 리듬을 따랐다: 줄높이 전 역할 1.5, 제목 무게 H1 700 / H2~H4 600, Body 16/400, Body Small 14/400, page-title은 toss의 가장 작은 제목 단계 H4 22px를 쓴다. H1 36 / H2 30은 카드와 목록이 빽빽한 이 앱과 320px 최소 폭 규칙에 맞지 않아 가져오지 않았다, body를 14px에서 toss의 16px로 올렸다. 320px 화면에서 좌우 여백 24px와 카드 안쪽 16px를 빼면 본문 폭이 240px이고, 모든 텍스트가 줄바꿈되므로 가로 스크롤이 생기지 않는다
- /foundations/tokens/space.stack-gap/$value — prompt-fact; value: "8px"; evidence: 이전 값 12px는 toss가 공개한 4 / 6 / 8 / 16 / 24 / 32 척도에 없는 단계였다, toss의 md 8px로 맞췄다. body가 14px에서 16px로 커진 만큼 묶음 안 간격을 좁혀 카드 높이를 유지한다, space.card-padding 16px는 toss의 lg, space.dialog-padding 24px는 toss의 xl과 이미 같아 그대로 뒀다
- /foundations/tokens/radius.card/$value — repository-fact; value: "12px"; evidence: app/trips/[tripId]/places/PlaceCard.tsx에서 확인한 값이다, toss의 반경 근거는 버튼 크기 사다리(8 / 10 / 14 / 16)와 문서 chrome(4 / 6)뿐이고, 레퍼런스가 스스로 카드 기하를 지어내지 말라고 적고 있어 대응하는 값이 없다, radius.control 8px는 toss의 button-small, radius.dialog 16px는 button-xlarge와 같아 그대로 뒀다
- /experience/brand_thesis — unresolved; evidence: Phase 4.5에서 사용자가 프로젝트 thesis 제공을 건너뛰었다, 저장소에는 thesis에 해당하는 문장이 없다 — 레퍼런스 문구를 옮겨 쓰지 않았다
- /experience/tagline — unresolved; evidence: Phase 4.5에서 사용자가 공식 tagline 제공을 건너뛰었다, app/layout.tsx의 metadata.description은 기능 설명이라 tagline으로 승격하지 않았다
- /experience/target_segments — unresolved; evidence: Phase 4.5에서 사용자가 타겟 사용자 segment 제공을 건너뛰었다, 저장소가 아는 것은 owner / editor / viewer 권한 구분뿐이고 이것은 persona가 아니다
- /typography_assets/font_license_evidence — unresolved; evidence: Geist와 Geist Mono가 next/font/google로 로드되는 사실까지만 확인했고 라이선스 원문은 확인하지 않았다, 저장소에도 라이선스 텍스트가 없다 — node_modules의 next/font 데이터에는 폰트 메타데이터만 있다, 확인 전까지 두 폰트를 에셋 목록에 올리지 않았다. 타입 역할의 패밀리 이름은 저장소에서 확인한 사실이므로 그대로 둔다
- /typography_assets/icon_system — unresolved; evidence: 현재 UI는 아이콘 세트 없이 한국어 라벨과 이모지 두 개만 쓴다, 기반 레퍼런스 toss도 아이콘 토큰을 제공하지 않는다 — 대신 만들어 넣지 않았다
