import { TOAST_ITEM_WIDTH } from "./ToastItem.styles";

// Toaster가 useInjectedStyle로 주입하는 CSS. 컴포넌트 파일(Toaster.tsx)과
// 분리한 이유는 (1) 스타일과 컴포넌트 로직을 나누기 위해서, (2) 컴포넌트를
// export하는 파일이 상수도 같이 export하면 React Fast Refresh가 깨지기
// 때문. 토스트별 top/z-index/pointer-events는 순서·개수·재정렬 상태에
// 따라 달라지는 진짜 동적 값이라(미리 유한하게 나열할 수 없다) 여전히
// Toaster.tsx의 인라인 style로 남아 있다. position/left는 ToastItem
// 자신의 기본 클래스에 이미 있다(ToastItem은 Toaster 없이 단독으로 쓰이지
// 않으므로 거기 있는 게 맞다) — 여기서 또 지정할 필요가 없다.
export const STYLE_KEY = "toaster";
export const STYLE_CSS = `
.sandwich-toaster {
  /* top:0 근처(맨 앞 토스트)가 화면 정중앙에 오도록 left:50% +
     translateX(-50%)로 잡는다. 자식들은 이 컨테이너 기준 absolute라서
     컨테이너 자체에 폭을 명시해야 translateX(-50%)가 카드 폭 기준으로
     정확히 중앙 정렬된다. */
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: ${TOAST_ITEM_WIDTH}px;
  z-index: 2147483647;
}
`;
