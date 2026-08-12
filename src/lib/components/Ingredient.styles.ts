import type { ToastIngredient } from "../store";

// Ingredient가 useInjectedStyle로 주입하는 CSS + 관련 상수. 컴포넌트
// 파일(Ingredient.tsx)과 분리한 이유는 (1) 스타일과 컴포넌트 로직을
// 나누기 위해서, (2) 컴포넌트를 export하는 파일이 상수도 같이 export하면
// React Fast Refresh가 깨지기 때문.

// 모든 재료의 렌더링 높이를 이 값 하나로 고정한다. 재료마다 원본 이미지
// 구도가 달라 자연 높이가 제각각이라(80~145px), 통일하지 않으면 재료별로
// 카드 비율이 들쭉날쭉해 보인다.
const TARGET_ROW_HEIGHT = 110;

// 재료마다 컨테이너에 필요한 예외가 달라서(lettuce/tomato/cheese는 겹쳐진
// 타일 전체를 자르고, bread는 이미지 자체를 크롭) 모디파이어 클래스로
// 나눈다.
export const INGREDIENT_CONTAINER_CLASS: Record<ToastIngredient, string> = {
  lettuce: "sandwich-toast-ingredient--lettuce",
  tomato: "sandwich-toast-ingredient--tomato",
  cheese: "sandwich-toast-ingredient--cheese",
  bread: "sandwich-toast-ingredient--bread",
  scrambled: "sandwich-toast-ingredient--scrambled",
};

export const STYLE_KEY = "ingredient";
export const STYLE_CSS = `
.sandwich-toast-ingredient {
  width: 100%;
  /* 케찹 오버레이(.sandwich-toast-ingredient-ketchup)를 이 컨테이너
     기준으로 절대 배치하기 위한 기준점. */
  position: relative;
}
/* 케찹 오버레이는 타일과 같은 부모(.sandwich-toast-ingredient)의 형제라
   .tile:nth-child/:only-child 선택자가 타일 개수를 셀 때 케찹까지 자식으로
   세면 안 된다(케찹 유무에 따라 손그림 회전이 붙었다 떨어졌다 하게 됨) —
   타일 전용 래퍼로 분리해서 그 선택자들이 항상 타일끼리만 보게 한다. */
.sandwich-toast-ingredient-tiles {
  display: flex;
  width: 100%;
}
/* lettuce/tomato/cheese: 여러 장이 겹쳐 타일링되는 재료 — 개별 이미지에
   object-fit을 주는 대신(그러면 타일 겹침 비율이 깨져서 사이가 벌어져
   보인다) 겹쳐진 행 전체(.tiles, 실제 flex 컨테이너)를 이 높이로 자른다.
   height는 반드시 실제 flex 컨테이너에 있어야 한다 — align-items:stretch가
   그 높이를 기준으로 각 타일의 크기를 계산하기 때문에, 바깥
   컨테이너(.sandwich-toast-ingredient)에 있으면 타일이 원본 비율대로
   부풀어 오르고 overflow로 잘려서 개수/배치가 깨진다. */
.sandwich-toast-ingredient--lettuce .sandwich-toast-ingredient-tiles,
.sandwich-toast-ingredient--tomato .sandwich-toast-ingredient-tiles,
.sandwich-toast-ingredient--cheese .sandwich-toast-ingredient-tiles {
  height: ${TARGET_ROW_HEIGHT}px;
  overflow: hidden;
}

.sandwich-toast-ingredient-tile {
  display: block;
  flex: 1;
  min-width: 0;
  height: auto;
}
/* bread/scrambled는 타일링 없이 이미지 한 장 — 원본 비율(4:1)이 그대로면
   다른 재료보다 훨씬 납작해서, 다른 재료와 같은 높이가 되도록 이미지
   자체를 크롭한다(object-fit: contain — 잘림 없이 레터박스). */
.sandwich-toast-ingredient--bread .sandwich-toast-ingredient-tile,
.sandwich-toast-ingredient--scrambled .sandwich-toast-ingredient-tile {
  height: ${TARGET_ROW_HEIGHT}px;
  object-fit: contain;
}

/* 케찹(ketchup.webp)은 scrambled.webp와 같은 800x200 캔버스라서 재료
   이미지 위에 그대로 겹쳐도 지그재그 모양이 정확히 맞는다. scrambled뿐
   아니라 어떤 재료가 로딩 중이든 이 위치 그대로 얹힌다(재료마다 실제
   그림 구도는 다르지만, 로딩 표시는 장식적 가니시라 정확히 겹칠 필요는
   없다). z-index는 타일 중 가장 높은 값(3)보다는 커야 하고(flex
   아이템은 z-index:auto가 아니면(타일들이 손그림 회전용으로 그렇다)
   position 없이도 자기 스택 컨텍스트를 만들어서, 케찹이 absolute이고
   z-index가 auto인 채로는 z-index가 있는 타일들보다 뒤로 밀려 일부
   타일에 가려진다), 메시지(ToastItem.styles.ts의 z-index: 5)보다는
   작아야 한다 — 메시지 텍스트를 케찹이 덮으면 안 된다. */
.sandwich-toast-ingredient-ketchup {
  position: absolute;
  inset: 0;
  width: 100%;
  height: ${TARGET_ROW_HEIGHT}px;
  object-fit: contain;
  z-index: 4;
  pointer-events: none;
  animation: sandwich-toast-ketchup-squeeze 2.4s ease-in-out infinite;
}
/* 케찹이 왼쪽에서 오른쪽으로 짜여 나오듯 그려지고(0%→50%), 잠깐 멈췄다가
   (50%→80%), 다시 걷히고(80%→100%) 반복한다. 시작/끝 clip-path가 완전히
   같아야(둘 다 전체 클립) 루프 경계에서 튐 없이 이어진다. */
@keyframes sandwich-toast-ketchup-squeeze {
  0% {
    clip-path: inset(0 100% 0 0);
  }
  50% {
    clip-path: inset(0 0% 0 0);
  }
  80% {
    clip-path: inset(0 0% 0 0);
  }
  100% {
    clip-path: inset(0 100% 0 0);
  }
}

/* 같은 행 안에서 타일끼리 겹치는 비율 (가로, 음수 margin). */
.sandwich-toast-ingredient-tile:not(:first-child) {
  margin-left: -24%;
}
/* 반복 타일마다 손그림 느낌으로 살짝 다른 각도 + z-index를 준다 — 여러
   장 겹쳐 타일링될 때만(:not(:only-child)) 적용하고, bread처럼 1장뿐일
   땐 회전 없이 그대로 둔다. repeat은 재료별로 고정된 값(1 또는 4)이라
   여기서도 최대 4장까지만 다룬다 — 나중에 그 이상 반복하는 재료가
   생기면 nth-child 규칙을 추가해야 한다.
   각도 값은 회전해도 모서리가 박스 밖으로 나오지 않도록 축소 보정한
   scale(0.95)과 세트다 — 정사각형에 가까운 이미지가 가장 큰 각도(4도)로
   회전했을 때 필요한 최소 축소량 기준(cos4°+sin4°≈1.067 → 1/1.067≈0.937)
   에 약간의 여유를 더한 값. */
.sandwich-toast-ingredient-tile:nth-child(1):not(:only-child) {
  z-index: 0;
  transform: rotate(-4deg) scale(0.95);
}
.sandwich-toast-ingredient-tile:nth-child(2) {
  z-index: 1;
  transform: rotate(3deg) scale(0.95);
}
.sandwich-toast-ingredient-tile:nth-child(3) {
  z-index: 2;
  transform: rotate(-2deg) scale(0.95);
}
.sandwich-toast-ingredient-tile:nth-child(4) {
  z-index: 3;
  transform: rotate(4deg) scale(0.95);
}
`;
