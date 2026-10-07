# 🥪 sandwich-toast

<img width="1162" height="771" alt="sandwich-toast demo screenshot" src="https://github.com/user-attachments/assets/4a120279-3021-445f-8465-457e9d05c511" />


샌드위치 재료가 겹겹이 쌓이는 React 토스트 알림 라이브러리입니다. 상태나 재료를 골라 알림을 만들고, 한입 먹는 애니메이션으로 닫을 수 있습니다.

**한국어** · [English](./README.en.md)

[데모](https://hungerbk.github.io/sandwich-toast/)

## 주요 기능

- 상태 기반 API와 재료 기반 API
- 겹쳐 쌓이는 토스트, 클릭 시 앞으로 이동하고 표시 시간 재시작
- 호버 중 자동 종료 일시정지
- 6가지 표시 위치와 크기 배율 설정
- loading 애니메이션과 케첩 토핑
- TypeScript 타입 제공, 별도 CSS import 불필요

## 실행하기

npm 패키지 배포는 준비 중입니다. 현재는 저장소를 받아 데모를 실행할 수 있습니다. React 19를 사용합니다.

```bash
git clone https://github.com/hungerbk/sandwich-toast.git
cd sandwich-toast
npm install
npm run dev
```

## 기본 사용법

한 앱에서 동시에 마운트된 `<Toaster />` 하나만 지원합니다. 여러 컴포넌트에서 같은 `toast` API를 호출할 수 있습니다. 각 토스트의 자동 종료 타이머는 해당 Toaster 내부에서 관리합니다. 개발 환경에서는 같은 라이브러리 모듈의 Toaster가 여러 개 마운트되면 콘솔에 경고합니다. 중복 렌더링을 차단하지는 않으며, 여러 개를 동시에 사용하는 동작은 보장하지 않습니다.

`<Toaster />`는 앱 최상단에 한 번 배치하고, 이벤트 핸들러에서 `toast`를 호출합니다. 아래 예시는 저장소의 `src/demo` 기준입니다.

```tsx
import { toast, Toaster } from "../lib";

export default function App() {
  return (
    <>
      <Toaster position="top-center" scale={1} />
      <button type="button" onClick={() => toast.success("저장했어요!")}>
        알림 띄우기
      </button>
    </>
  );
}
```

## Portal과 스타일 상속

서버에서 `toast` 생성 메서드를 호출하면 알림을 저장하거나 ID를 증가시키지 않고 빈 문자열(`""`)을 반환합니다. `toast.dismiss()`도 서버에서는 아무 동작을 하지 않습니다. 서버 알림을 브라우저로 전달하거나 요청 간에 공유하지 않으며, 알림 생성은 브라우저의 이벤트 핸들러 또는 effect에서 호출하세요.

`<Toaster />`는 브라우저에 마운트된 뒤 `document.body`에 Portal로 렌더링됩니다. 별도 Provider나 Portal 컨테이너 설정은 필요하지 않습니다. 서버 렌더링과 클라이언트의 첫 렌더에서는 토스트 DOM을 만들지 않습니다.

토스트는 JSX에서 감싸는 컨테이너의 `transform`, `overflow`, stacking context에서 벗어납니다. 글꼴·글자 크기와 상속 가능한 CSS 변수는 실제 DOM 부모인 `body`를 기준으로 상속합니다. 앱과 공유할 글꼴이나 테마 변수는 `html` 또는 `body`에 선언하세요. `#root`나 특정 컨테이너에만 적용한 스타일·테마 클래스는 자동으로 전달되지 않습니다. `html`·`body` 자체의 스타일 영향까지 제거하지는 않습니다.

React context와 이벤트 전파는 기존 React 트리를 따릅니다. 토스트 클릭이 앱의 상위 클릭 핸들러에 전달될 수 있으므로, 기존처럼 `<Toaster />`를 앱 최상단에 배치하는 것을 권장합니다. [React Portal 문서](https://react.dev/reference/react-dom/createPortal)

일반 레이어와의 표시 순서는 CSS stacking context와 `z-index`를 따릅니다. `showModal()`로 연 네이티브 `<dialog>`는 브라우저의 top layer에 표시되고 바깥 영역을 비활성화하므로, `body`의 토스트를 모달 위에 표시하거나 조작하는 것은 지원하지 않습니다. 모달 안에서 필요한 안내는 모달 내부에 표시하세요. 다른 모달 라이브러리도 포커스 제한이나 외부 영역 비활성화 정책에 따라 토스트 조작을 제한할 수 있습니다. [MDN showModal 문서](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal)

## Content Security Policy (CSP)

엄격한 CSP를 사용하는 앱에서는 서버가 응답마다 생성한 nonce를 첫 마운트부터 전달하세요.

```tsx
<Toaster nonce={nonce} />
```

동일한 nonce를 CSP의 `style-src 'nonce-…'`에 허용해야 합니다. `style-src-elem`을 별도로 지정하는 경우 해당 정책에도 nonce를 허용해야 합니다.

nonce는 앱에서 생성하여 전달하며, 라이브러리가 생성하지 않습니다. 응답마다 암호학적으로 안전한 난수를 새로 사용하고 고정값을 사용하지 마세요. 스타일은 한 번 삽입되므로 같은 문서에서는 첫 마운트부터 동일한 nonce를 유지해야 합니다. 중간 변경이나 nonce 누락 후 복구는 지원하지 않습니다.

이미지는 인라인 WebP을 사용하므로 `img-src`에서 `data:`를 허용해야 합니다. 이 허용은 이미지 지시문에만 적용하세요. 스타일을 위해 `unsafe-inline`을 허용할 필요는 없습니다.

현재 확인한 환경에서는 `style-src-attr 'none'`을 유지한 상태에서도 scale·위치 변경·호버·닫기가 정상 동작했습니다. 실제 지원 대상 브라우저와 CSP 정책에서도 확인하세요. [MDN: style-src-attr](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/style-src-attr)

## SSR과 React Server Components

일반 React SSR에서는 서버와 hydration 첫 렌더에 토스트 DOM을 출력하지 않습니다.
서버 snapshot은 항상 같은 빈 배열이며, 서버의 알림 상태를 클라이언트에 복원하지 않습니다.
브라우저 마운트 후 Portal을 생성하고 `useInsertionEffect`로 스타일을 주입하므로
별도의 서버 토스트 CSS 추출이나 스타일 Provider는 필요하지 않습니다.

현재 패키지 엔트리는 `'use client'` 지시문이나 별도의 `react-server` 엔트리를 제공하지 않습니다.
Next.js App Router 같은 RSC 환경에서는 소비 앱의 Client Component 안에서 패키지를 import하세요.
Server Component에서 패키지를 직접 import해 Toaster를 렌더링하거나 `toast`를 호출하는 사용법은 지원하지 않습니다.
일반 SSR에서의 서버 호출 무동작 처리가 RSC에서 직접 import할 수 있다는 의미는 아닙니다.

다음은 패키지 설치 후 사용할 경계 구성 예시입니다. 기존 저장소 데모의 상대 import 예시와 구분합니다.

```tsx
// app/toast-client.tsx
'use client';

import { Toaster } from 'sandwich-toast';

export default function ToastClient() {
  return <Toaster />;
}
```

```tsx
// app/layout.tsx
import type { ReactNode } from 'react';
import ToastClient from './toast-client';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        {children}
        <ToastClient />
      </body>
    </html>
  );
}
```

레이아웃 전체를 Client Component로 바꿀 필요는 없습니다.
`toast`를 사용하는 버튼도 Client Component에서 import하고 이벤트 핸들러로 호출하세요.
Server Action의 결과를 알림으로 표시하려면 클라이언트가 결과를 받은 뒤 `toast`를 호출합니다.
렌더 함수 실행 중에는 호출하지 않습니다.

일반 React의 `renderToString`·`hydrateRoot`와 브라우저 스타일 적용은 검증했습니다.
위 RSC 예시는 [Next.js의 Client Component 경계 안내](https://nextjs.org/docs/app/getting-started/server-and-client-components)에 따른 구성 가이드이며,
현재 Next.js App Router의 실제 빌드·실행 검증을 완료한 것은 아닙니다.

## 상태와 재료로 사용하기

상태 메서드는 기본 재료를 사용합니다.

```ts
toast.success("저장했어요!");       // 상추
toast.error("다시 시도해주세요."); // 토마토
toast.warning("확인해주세요.");   // 치즈
toast.info("새 소식이 있어요.");   // 빵
toast.loading("준비 중이에요.");  // 스크램블 에그
```

재료를 직접 선택할 수도 있습니다. 기본 상태는 각각 success, error, warning, info, loading입니다.

```ts
toast.lettuce("아삭한 소식이에요.");
toast.tomato("토마토가 도착했어요.");
toast.cheese("치즈를 추가했어요.");
toast.bread("따끈한 소식이에요.");
toast.scrambled("스크램블 에그를 만들고 있어요.");
```

상태 메서드는 `ingredient`를, 재료 메서드는 `type`을 바꿀 수 있습니다. 재료 메서드의 재료는 유지됩니다.

```ts
toast.success("완료했어요!", { ingredient: "tomato", duration: 6000 });
toast.bread("준비 중이에요.", { type: "loading" });
toast.cheese("케첩도 추가했어요.", { ketchup: true });
```

## 메시지 작성

토스트는 짧은 알림을 위한 것으로, 메시지를 최대 2줄까지 표시하고 넘치는 내용은 말줄임표로 생략합니다. 글자 크기는 `body`에서 상속하므로 화면에 표시되는 글자 수는 글꼴·글자 크기·scale에 따라 달라집니다.

데모에서 확인한 한글 문구는 공백·문장부호 포함 약 34자까지 표시됐습니다. 한글 알림은 우선 **30자 안팎**으로 작성하고 실제 앱에서 확인하는 것을 권장합니다. 이는 참고용 길이이며 고정 글자 수 제한이나 표시 보장값은 아닙니다. 영문 등 다른 언어는 표시량이 달라집니다.

핵심 결과나 필요한 행동을 문장 앞에 적고, 상세 내용은 앱의 별도 화면에서 확인할 수 있도록 구성하세요. 현재 잘린 메시지를 시각적으로 펼쳐 보는 기능은 제공하지 않습니다.

## 위치와 크기

`position`의 기본값은 `top-center`, `scale`의 기본값은 `1`입니다.

`scale`의 범위는 `0.5~1.5`입니다. 유한한 양수가 범위를 벗어나면 가장 가까운 경계값으로 보정합니다(예: `0.2` → `0.5`, `2` → `1.5`). `0`, 음수, `NaN`, `Infinity` 등 유효하지 않은 값은 기본값 `1`로 처리합니다. 범위 안에서도 글꼴이나 화면 크기에 따라 가독성과 배치를 확인해주세요.

- `top-left`, `top-center`, `top-right`
- `bottom-left`, `bottom-center`, `bottom-right`

```tsx
<Toaster position="bottom-right" scale={0.8} />
```

## 안내 문구와 언어

`toastLabels`는 한국어(`ko`)와 영어(`en`) 프리셋을 제공합니다. 기본값은 한국어이며 언어를 자동으로 감지하지 않습니다. 아래 import 경로는 저장소의 `src/demo` 기준입니다.

```tsx
import { Toaster, toastLabels } from '../lib';

<Toaster {...toastLabels.en} />
```

프리셋 하나를 전달하면 닫기 버튼 이름과 키보드 안내 문구가 함께 적용됩니다. 위 예시는 두 문구를 모두 영어로 설정합니다. 한국어는 기본값이므로 `<Toaster />`만 사용해도 됩니다.

- `closeButtonLabel`: 스크린 리더가 읽는 닫기 버튼 이름입니다. 화면의 × 표시는 유지됩니다.
- `reorderHint`: 메시지 버튼에 키보드 포커스가 있을 때 표시하는 안내이며, 스크린 리더의 버튼 설명에도 사용합니다.

개별 속성으로 문구를 덮어쓸 수 있습니다. 앱 언어에 맞는 비어 있지 않은 문구를 사용하세요. 토스트 본문은 `toast` 호출 시 전달한 문구를 그대로 사용합니다.

다른 언어는 라이브러리 소스를 수정하지 않고, 앱의 라벨 파일에 객체를 추가해 전달하세요. 기존 프리셋과 함께 관리할 수도 있습니다.

```tsx
const appToastLabels = {
  ...toastLabels,
  ja: {
    closeButtonLabel: '閉じる',
    reorderHint: 'Enter/Space キーで最前面に移動',
  },
};

<Toaster {...appToastLabels.ja} />
```

## 표시 시간

`duration`의 단위는 ms입니다. 기본값은 일반 토스트 `4000`, loading 타입 `Infinity`입니다.

- `0`~`2147483647`을 사용할 수 있습니다. `0`은 대기 없이 종료를 예약하며 삭제 애니메이션은 실행됩니다.
- `Infinity`는 자동 종료하지 않습니다.
- 음수, `NaN`, 최대 범위를 넘는 값(`Infinity` 제외)은 최종 타입의 기본값으로 처리합니다.
- 호버를 해제하면 남은 시간을 이어 세고, 토스트를 클릭하면 전체 시간을 다시 셉니다.

## 비동기 작업과 삭제

생성 메서드는 토스트 ID를 반환합니다. loading은 기본적으로 자동 종료되지 않으므로 작업 완료 시 삭제해주세요. 유한 `duration`을 지정한 loading은 자동 종료됩니다.

```ts
async function saveWithToast(saveData: () => Promise<void>) {
  const id = toast.loading("저장 중이에요.");
  try {
    await saveData();
    toast.success("저장했어요!");
  } catch {
    toast.error("저장하지 못했어요.");
  } finally {
    toast.dismiss(id);
  }
}
```

- 자동 종료·닫기 버튼: 한입 애니메이션 후 삭제합니다. Web Animations 미지원 시 즉시 삭제합니다.
- `toast.dismiss(id)`: 해당 토스트를 한입 애니메이션 후 삭제합니다. Toaster가 없거나 Web Animations를 지원하지 않으면 즉시 삭제합니다.
- `toast.dismiss()`: loading을 포함한 모든 토스트를 즉시 삭제합니다.

표시 개수 제한과 대기열은 없습니다. 모든 활성 토스트를 표시하며, `duration: Infinity`인 토스트는 수동으로 삭제해야 합니다.

## 키보드 탐색

Tab/Shift+Tab으로 메시지 버튼과 닫기 버튼을 탐색합니다. 두 버튼에서 ↑/↓ 키를 누르면 화면에 쌓인 순서대로 이전/다음 카드의 메시지 버튼으로 이동합니다. 상단·하단 배치 모두 같은 방향이며, 재정렬하면 이동 순서도 바뀝니다. 처음과 마지막에서는 멈추고 닫기 중인 카드는 건너뜁니다.

같은 카드 안에서는 → 키로 닫기 버튼에, ← 키로 메시지 버튼에 이동합니다. 이미 해당 버튼에 있으면 이동하지 않으며 다른 카드로 넘어가지 않습니다.

메시지 버튼에서 Enter/Space를 누르면 맨 앞으로 가져옵니다. 포커스 중에는 카드가 펼쳐지고 자동 종료가 정지합니다. 보조 키와 함께 누른 방향키는 처리하지 않습니다. 스크린 리더가 방향키를 자체 탐색에 사용하는 경우 해당 키가 페이지에 전달되어야 이 기능이 동작합니다.

## 스크린 리더 알림

새 토스트의 메시지는 포커스를 이동하지 않고 전달합니다. `error`는 즉시 전달하는 `alert`, `success`, `info`, `warning`, `loading`은 현재 낭독이 끝난 뒤 전달하는 `status`를 사용합니다. 삭제와 화면상 재정렬은 자동 알림 대상에 포함하지 않습니다. 키보드로 메시지 버튼에 포커스하면 내용을 다시 확인할 수 있습니다.

빠르게 연속 발생하는 알림은 브라우저와 스크린 리더에 따라 낭독이 누락되거나 중단될 수 있습니다. VoiceOver에서 이 현상을 확인했으며, 연속 알림 전달 개선은 후속 이슈에서 다룹니다. 모든 메시지의 순차 낭독을 보장하지 않습니다.

## 모션 감소

기기의 모션 감소 설정(`prefers-reduced-motion: reduce`)을 따릅니다. 케첩은 정적으로 표시하고, 호버 확대와 위치 전환 애니메이션을 사용하지 않습니다. 닫기 시 모션 감소가 설정되어 있으면 한입 애니메이션 없이 제거합니다. 표시 시간과 일시정지 동작은 유지됩니다.

## 개발

```bash
npm run dev         # 데모 개발 서버
npm run build       # 라이브러리 빌드 → dist
npm run build:demo  # 데모 빌드 → dist-demo
npm run typecheck
npm run lint
```

- `src/lib`: 라이브러리 API, 컴포넌트, 훅, 재료 이미지
- `src/demo`: 샌드위치 가게 콘셉트의 데모

배포 준비와 후속 개선은 [이슈](https://github.com/hungerbk/sandwich-toast/issues)에서 관리합니다.
