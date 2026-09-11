export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'
export type ToastIngredient = 'lettuce' | 'tomato' | 'cheese' | 'bread' | 'scrambled'

export interface Toast {
  id: string
  message: string
  type: ToastType
  ingredient: ToastIngredient
  // loading은 항상 애니메이션을 표시하고, 그 외에는 정적 토핑을 표시한다.
  ketchup: boolean
  // ms. Infinity는 자동 종료하지 않는다.
  duration: number
}

export interface ToastOptions {
  type?: ToastType;
  ingredient?: ToastIngredient;
  // loading 외의 타입에 정적 케찹 토핑을 표시한다.
  ketchup?: boolean;
  // ms. 기본 4000, loading은 Infinity(수동 종료).
  duration?: number;
}

export type StandardToastOptions = Omit<ToastOptions, "type">;
export type IngredientToastOptions = Omit<ToastOptions, "ingredient">;

export type ToasterPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'

export interface ToasterProps {
  position?: ToasterPosition
  scale?: number
}
