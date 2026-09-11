export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'
export type ToastIngredient = 'lettuce' | 'tomato' | 'cheese' | 'bread' | 'scrambled'

export interface Toast {
  id: string
  message: string
  type: ToastType
  ingredient: ToastIngredient
  // 로딩 여부와 무관하게 재료 위에 케찹을 얹을지. type이 'loading'이면 이
  // 값과 무관하게 항상 케찹이 얹히고(애니메이션까지), 'loading'이 아닐 때
  // ketchup만 true면 애니메이션 없이 정적으로 얹힌다.
  ketchup: boolean
  // ms. Infinity면 자동으로 사라지지 않는다(로딩 토스트 기본값).
  duration: number
}

export interface ToastOptions {
  type?: ToastType;
  ingredient?: ToastIngredient;
  // 로딩과 무관하게 재료 위에 케찹을 정적으로(애니메이션 없이) 얹고
  // 싶을 때. type이 'loading'이면 이 값과 무관하게 항상 애니메이션과
  // 함께 얹힌다.
  ketchup?: boolean;
  // ms. 명시 안 하면 type이 'loading'인지로 정해진다 (로딩 토스트는
  // 시간이 아니라 수동으로 종료되는 게 자연스러우니 기본 무제한).
  duration?: number;
}

export type StandardToastOptions = Omit<ToastOptions, "type">;
export type IngredientToastOptions = Omit<ToastOptions, "ingredient">;

export type ToasterPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'

export interface ToasterProps {
  // 토스트 스택이 화면의 어느 지점에 붙을지. 기본은 화면 중앙 상단.
  position?: ToasterPosition
  // 카드 폭/재료 높이/padding/삭제 버튼 등 전체 크기 배율. 기본은 1(원래
  // 크기). CSS 커스텀 속성(SCALE_VAR)으로 컨테이너에 지정해서 상속시키므로,
  // 스택 간격(RESTING_GAP)·호버 밀림 거리(EXTRA_LIFT)처럼 JS에서 직접
  // px로 계산하는 값들만 여기서 별도로 곱해준다.
  scale?: number
}
