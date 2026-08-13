import { TOAST_ITEM_WIDTH } from "./ToastItem.styles";

// 호버된 토스트와 그 뒤에 있는 토스트들을 아래로 얼마나 밀어낼지(peek
// 연출, px). 예전엔 위에 쌓인 토스트를 위로 들어올렸는데, 맨 앞 토스트가
// 뷰포트 위로 넘어가는 문제(issue #27)가 있었다 — 아래로 미는 방향이면
// 화면 위쪽 여백을 늘릴 필요 없이 항상 안전하다.
export const EXTRA_LIFT = 70;

// Toaster가 useInjectedStyle로 주입하는 CSS. 컴포넌트 파일(Toaster.tsx)과
// 분리한 이유는 (1) 스타일과 컴포넌트 로직을 나누기 위해서, (2) 컴포넌트를
// export하는 파일이 상수도 같이 export하면 React Fast Refresh가 깨지기
// 때문. 토스트별 top/z-index/pointer-events는 순서·개수·재정렬 상태에
// 따라 달라지는 진짜 동적 값이라(미리 유한하게 나열할 수 없다) 여전히
// Toaster.tsx의 인라인 style로 남아 있다. position/left는 ToastItem
// 자신의 기본 클래스에 이미 있다(ToastItem은 Toaster 없이 단독으로 쓰이지
// 않으므로 거기 있는 게 맞다) — 여기서 또 지정할 필요가 없다.
// 화면 가장자리로부터의 여백. top/bottom/left/right 모디파이어가 전부
// 공유하는 값이라 하나만 바꾸면 네 방향 다 같이 바뀐다.
const EDGE_MARGIN = 24;

export const STYLE_KEY = "toaster";
export const STYLE_CSS = `
.sandwich-toaster {
  /* 자식들은 이 컨테이너 기준 absolute라서, translateX(-50%)로 가운데
     정렬하려면(center) 컨테이너 자체에 폭이 명시돼 있어야 카드 폭
     기준으로 정확히 중앙 정렬된다. */
  position: fixed;
  width: ${TOAST_ITEM_WIDTH}px;
  z-index: 2147483647;
}
.sandwich-toaster--top {
  top: ${EDGE_MARGIN}px;
}
.sandwich-toaster--bottom {
  bottom: ${EDGE_MARGIN}px;
}
.sandwich-toaster--left {
  left: ${EDGE_MARGIN}px;
}
.sandwich-toaster--center {
  left: 50%;
  transform: translateX(-50%);
}
.sandwich-toaster--right {
  right: ${EDGE_MARGIN}px;
}
`;
