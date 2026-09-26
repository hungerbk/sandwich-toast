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

한 앱에서 동시에 마운트된 `<Toaster />` 하나만 지원합니다. 여러 컴포넌트에서 같은 `toast` API를 호출할 수 있습니다. 각 토스트의 자동 종료 타이머는 해당 Toaster 내부에서 관리합니다. 중복 Toaster를 런타임에서 차단하지는 않지만, 여러 개를 동시에 사용하는 동작은 보장하지 않습니다.

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

## 위치와 크기

`position`의 기본값은 `top-center`, `scale`의 기본값은 `1`입니다.

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
