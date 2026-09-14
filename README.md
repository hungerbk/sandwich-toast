# 🥪 sandwich-toast

<img width="1162" height="771" alt="스크린샷 2026-09-15 오전 2 07 34" src="https://github.com/user-attachments/assets/4a120279-3021-445f-8465-457e9d05c511" />


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
- `toast.dismiss(id)`: 해당 토스트를 애니메이션 없이 즉시 삭제합니다.
- `toast.dismiss()`: loading을 포함한 모든 토스트를 즉시 삭제합니다.

표시 개수 제한과 대기열은 없습니다. 모든 활성 토스트를 표시하며, `duration: Infinity`인 토스트는 수동으로 삭제해야 합니다.

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
