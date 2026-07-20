// Ingredient가 재료 행을 쌓는 기하(행 높이/겹침 비율)와, 그 기하를 거꾸로
// 이용해 "이 픽셀 높이를 담으려면 몇 행이 필요한지" 계산하는 함수.
// Ingredient.tsx(컴포넌트)와 별도 파일로 둔 이유는 순전히 React Fast
// Refresh 때문 — 컴포넌트를 export하는 파일이 상수/함수도 같이 export하면
// 그 파일의 HMR이 깨진다.

// 모든 재료의 한 행 높이를 이 값 하나로 고정한다. 재료마다 원본 이미지
// 구도가 달라 자연 높이가 제각각인데(80~145px), 그 차이를 남겨두면
// ROW_OVERLAP_RATIO(카드 너비 기준, 행 높이와 무관하게 항상 고정 px)이
// 행마다 다른 비율로 파고들어서 — 행이 짧은 재료(bread)일수록 행 하나
// 늘 때 실제로 늘어나는 순 높이가 더 작아진다 — 같은 줄 수의 메시지인데도
// 재료에 따라 필요한 행 수가 달라져 버렸다. 전부 같은 높이로 맞추면 이
// 계산이 재료와 무관하게 성립한다. Ingredient.tsx의 INGREDIENT_ASSETS가
// 이 값으로 모든 재료의 style/rowStyle을 맞춘다.
export const TARGET_ROW_HEIGHT = 110

// 행끼리 겹치는 비율 (세로, 음수 margin-top). 퍼센트 margin은(margin-top
// 이라도) 컨테이너의 너비 기준으로 계산되는 CSS 규칙 때문에, 실제 겹치는
// px는 행 자신의 높이가 아니라 "카드 너비 * 이 비율"이다.
// Ingredient.tsx가 CSS marginTop에, rowsForContentHeight가 아래 계산에
// 각각 이 값을 그대로 재사용해서 실제 겹침과 다른 계산을 하지 않도록 한다.
export const ROW_OVERLAP_RATIO = 0.25

// 딱 맞는 높이로 판단하면 소비자 페이지의 실제 폰트 메트릭이 측정
// 당시와 아주 조금만 달라도(줄간격 반올림 오차 등) 텍스트가 카드 밖으로
// 살짝 넘칠 수 있다 — 그런 위험보다는 가끔 행이 하나 더 붙는 쪽이
// 안전하다. 실제 행/겹침 기하(TARGET_ROW_HEIGHT, ROW_OVERLAP_RATIO)는
// 그대로 두고, "필요한 높이" 쪽에만 여유를 얹어서 판단만 보수적으로
// 만든다.
const NEEDED_HEIGHT_SAFETY_MARGIN = 20

// 재료 행이 쌓이는 실제 기하를 기준으로 "이 픽셀 높이를 담으려면 재료가
// 몇 행 필요한지" 계산한다. 첫 행은 TARGET_ROW_HEIGHT 그대로지만, 두
// 번째 행부터는 카드 너비 기준 ROW_OVERLAP_RATIO만큼 겹쳐 쌓이므로, 행이
// 하나 늘 때마다 순수하게 늘어나는 높이는 TARGET_ROW_HEIGHT에서 그 겹침
// px를 뺀 값이다. 모든 재료의 행 높이가 TARGET_ROW_HEIGHT로 통일돼 있어서
// 이 계산은 재료와 무관하게 항상 성립한다.
export function rowsForContentHeight(neededHeightPx: number, cardWidthPx: number): number {
  const bufferedNeededHeightPx = neededHeightPx + NEEDED_HEIGHT_SAFETY_MARGIN
  const overlapPx = cardWidthPx * ROW_OVERLAP_RATIO
  const heightPerExtraRow = TARGET_ROW_HEIGHT - overlapPx
  if (bufferedNeededHeightPx <= TARGET_ROW_HEIGHT || heightPerExtraRow <= 0) return 1
  const extraRows = Math.ceil((bufferedNeededHeightPx - TARGET_ROW_HEIGHT) / heightPerExtraRow)
  return 1 + extraRows
}

// rowsForContentHeight의 역방향: 주어진 행 수가 실제로 담을 수 있는 최대
// 콘텐츠+패딩 픽셀 용량. 메시지 말줄임표(line-clamp) 기준을 "몇 줄"로
// 하드코딩하는 대신, 이 값을 실측 line-height로 나눠서 구하면 텍스트가
// 카드가 담을 수 있는 최대 행 수(maxRows)보다 항상 정확히 맞아떨어진다 —
// 두 숫자를 손으로 맞춰야 하는 동기화 버그 자체가 생기지 않는다.
export function maxContentCapacityForRows(maxRows: number, cardWidthPx: number): number {
  const overlapPx = cardWidthPx * ROW_OVERLAP_RATIO
  const heightPerExtraRow = TARGET_ROW_HEIGHT - overlapPx
  return TARGET_ROW_HEIGHT + Math.max(0, maxRows - 1) * heightPerExtraRow
}
