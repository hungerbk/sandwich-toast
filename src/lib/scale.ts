// Toaster의 scale prop이 실리는 CSS 커스텀 속성. Toaster가 컨테이너에
// 인라인으로 지정하면, 상속을 통해 ToastItem/Ingredient의 모든 CSS
// px 값에 그대로 반영된다 — 값 하나만 바뀌면 카드 폭, 재료 높이,
// padding, 삭제 버튼 크기까지 전부 비율대로 함께 바뀐다.
export const SCALE_VAR = "--sandwich-toast-scale";

// 여러 styles.ts 파일에서 "이 px 값에 scale을 곱해서 쓴다"는 패턴이
// 반복돼서 헬퍼로 뺐다 — SCALE_VAR 문자열을 각 파일에 따로 하드코딩하면
// 오타로 어긋날 위험이 있다.
export function scaled(px: number): string {
  return `calc(var(${SCALE_VAR}, 1) * ${px}px)`
}
