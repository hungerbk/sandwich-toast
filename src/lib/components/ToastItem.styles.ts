import type { ToastIngredient } from "../store";

// ToastItem이 useInjectedStyle로 주입하는 CSS + 그와 관련된 상수. 컴포넌트
// 파일(ToastItem.tsx)과 분리한 이유는 (1) 스타일과 컴포넌트 로직을 나누기
// 위해서, (2) 컴포넌트를 export하는 파일이 상수도 같이 export하면 React
// Fast Refresh가 깨지기 때문 — TOAST_ITEM_WIDTH/TOAST_ITEM_TRANSITION_MS는
// Toaster.tsx도 가져다 쓰므로 어차피 ToastItem.tsx 밖에 있어야 한다.

export const TOAST_ITEM_WIDTH = 320;

// 위치(top)/리프트(transform) 이동에 쓰는 트랜지션 시간. Toaster가 재정렬
// 애니메이션이 끝나는 시점을 알아야 할 때(예: 재정렬 중 호버 억제) 이
// 값을 기준으로 계산한다.
export const TOAST_ITEM_TRANSITION_MS = 320;

// 재료 한 행(TARGET_ROW_HEIGHT=110px)이면 2줄 정도의 메시지는 여유
// 있게 담긴다 — 그래서 재료를 여러 행으로 쌓지 않고 항상 기본 1행으로
// 고정하고, 메시지를 2줄로 제한한다. 예전에는 메시지 길이에 따라 재료
// 행 수를 늘리는 동적 계산(rowsForContentHeight)이 있었지만, 재료마다
// 실제 렌더링 높이가 다르고(과거 버그) 겹침 비율까지 얽혀서 계산이
// 쉽게 어긋났다 — 메시지를 2줄로 짧게 제한하면 그 복잡도 자체가
// 필요 없어진다.
const MAX_MESSAGE_LINES = 2;

// 메시지 상하/좌우 padding.
const MESSAGE_PADDING_Y = 18;
const MESSAGE_PADDING_X = 28;

// liftOffset(형제 토스트가 호버로 비켜서는 픽셀값)만 인스턴스마다 달라지는
// 진짜 동적 값이라 CSS 커스텀 속성으로 인라인에 남긴다. 나머지(색상,
// padding, hover 확대, 재료별 clip-path/여백 등)는 전부 라이브러리가 정한
// 유한한 값이라 아래 CSS로 한 번만 주입한다 — useInjectedStyle 참고.
export const LIFT_VAR = "--sandwich-toast-lift";

// 재료 그림이 사각형 박스를 꽉 채우지 않으면, 빈 모서리가 마우스 이벤트를
// 가로채서 뒤에 쌓인 다른 토스트를 호버하기 어렵게 만든다. 그 모서리만큼
// 카드 자체를 clip-path로 잘라내 이벤트가 통과하도록 한다. 이미지 실루엣에
// 정확히 맞출 필요는 없고, 문제가 되는 영역만 대략 잘라낸다. tomato/cheese/
// lettuce만 해당 — bread는 캔버스를 거의 꽉 채워서 clip이 필요 없다.
export const INGREDIENT_CLIP_CLASS: Partial<Record<ToastIngredient, string>> = {
  lettuce: "sandwich-toast-item--lettuce",
  tomato: "sandwich-toast-item--tomato",
  cheese: "sandwich-toast-item--cheese",
};

// 재료마다 이미지 구도(글자가 놓일 안전한 영역)가 달라서 메시지 위치를
// 일괄 적용할 수 없다 — 재료별 예외를 모디파이어 클래스로 둔다. tomato는
// 기본값 그대로 괜찮아서 항목이 없다.
export const INGREDIENT_MESSAGE_CLASS: Partial<Record<ToastIngredient, string>> = {
  lettuce: "sandwich-toast-message--lettuce",
  bread: "sandwich-toast-message--bread",
  cheese: "sandwich-toast-message--cheese",
};

// useInjectedStyle의 key/css는 안정된 참조여야 한다(렌더마다 새로 만들면
// 매번 재주입 검사를 하게 된다) — 모듈이 처음 로드될 때 한 번만 계산된다.
export const STYLE_KEY = "toast-item";
export const STYLE_CSS = `
.sandwich-toast-item {
  /* 내부의 절대 위치 자식(메시지/삭제 버튼)이 자리 잡을 기준이 필요해서
     position이 static이면 안 된다. absolute로 두는 이유는 라이브러리
     설계상 ToastItem이 Toaster 없이 단독으로 쓰이는 경우가 없어서다
     (공개 API로 export되지도 않는다) — Toaster가 항상 이 컴포넌트를
     자기 컨테이너 기준으로 쌓아야(absolute) 해서, 그 쪽에서 다시
     덮어쓰게 만들 이유가 없다. */
  position: absolute;
  left: 0;
  width: ${TOAST_ITEM_WIDTH}px;
  transform: translateY(calc(var(${LIFT_VAR}, 0px) * -1)) scale(1);
  transition: transform ${TOAST_ITEM_TRANSITION_MS}ms ease-in-out, top ${TOAST_ITEM_TRANSITION_MS}ms ease-in-out;
}
.sandwich-toast-item:hover {
  transform: translateY(calc(var(${LIFT_VAR}, 0px) * -1)) scale(1.12);
}
.sandwich-toast-item--clickable {
  cursor: pointer;
}
.sandwich-toast-item--dismissing {
  pointer-events: none;
}
.sandwich-toast-item--lettuce {
  clip-path: polygon(15% 0%, 100% 0%, 100% 58%, 58% 100%, 0% 100%);
}
.sandwich-toast-item--tomato {
  clip-path: polygon(19% 0%, 81% 0%, 100% 20%, 100% 81%, 81% 100%, 18% 100%, 0% 81%, 0% 19%);
}
.sandwich-toast-item--cheese {
  clip-path: polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%);
}

.sandwich-toast-message {
  position: absolute;
  inset: 0;
  /* Ingredient 내부 이미지들이 자체 z-index를 쓰고 있어서, 명시적으로
     더 높은 값을 줘야 그 위로 확실히 온다. */
  z-index: 5;
  margin: 0;
  padding: ${MESSAGE_PADDING_Y}px ${MESSAGE_PADDING_X}px;
  overflow-wrap: break-word;
  box-sizing: border-box;
  /* 상속된 색/정렬을 그대로 쓰면 소비자 앱의 전역 스타일(회색 텍스트,
     가운데 정렬 등)을 그대로 물려받아 재료 이미지 위에서 잘 안 보이거나
     의도와 다르게 배치될 수 있다 — 라이브러리는 외부 CSS에 기대지
     않는다는 원칙대로 명시적으로 지정한다. font-size/font-family는
     예외적으로 소비자 서비스의 것을 그대로 상속받게 둔다. */
  color: #1a1a1a;
  text-align: left;
  display: flex;
  align-items: center;
}
.sandwich-toast-message--lettuce {
  padding-left: 40px;
}
.sandwich-toast-message--bread {
  padding-left: 40px;
  transform: translateY(-4px);
}
.sandwich-toast-message--cheese {
  transform: translateY(-8px);
}

.sandwich-toast-message-text {
  /* 카드 전체가 아니라 텍스트 영역만 감싸도록 내용 크기에 맞춘다.
     max-width는 긴 메시지가 카드 밖으로 넘치지 않고 줄바꿈되도록 하는
     상한선. */
  width: fit-content;
  max-width: 100%;
  /* 재료 이미지가 화려해서 글자색만으로는 대비가 부족할 수 있다 —
     반투명 흰 배경을 텍스트 뒤에만 깔아 가독성을 보장한다(카드 전체를
     덮지 않고 텍스트 영역만 감싸서 재료 그림은 그대로 보임). */
  background: rgba(255, 255, 255, 0.45);
  border-radius: 8px;
  padding: 4px 10px;
  box-sizing: border-box;
  /* MAX_MESSAGE_LINES를 넘는 메시지는 여기서 말줄임표로 자른다. */
  display: -webkit-box;
  -webkit-line-clamp: ${MAX_MESSAGE_LINES};
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sandwich-toast-dismiss-button {
  position: absolute;
  z-index: 10;
  /* 오른쪽 가장자리 세로 40% 지점(중앙). 위 clip-path들이 전부 x=100%
     기준 y 20~80% 구간은 안 잘라내므로 40%는 항상 히트테스트
     사각지대 밖이다. */
  top: 40%;
  right: 4px;
  transform: translateY(-40%) scale(1);
  width: 22px;
  height: 22px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  /* 검정 배경은 재료 이미지와 톤이 안 맞아서 흰 배경 + 어두운 ×로,
     밝은 이미지(치즈/빵) 위에서도 경계가 보이도록 그림자를 준다. */
  background: rgba(255, 255, 255, 0.75);
  color: #1a1a1a;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  transition: transform 120ms ease-out, background 120ms ease-out, box-shadow 120ms ease-out;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}
.sandwich-toast-dismiss-button:hover {
  transform: translateY(-40%) scale(1.15);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
}
`;
