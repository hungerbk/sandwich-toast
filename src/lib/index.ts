import {
  addToast,
  clearToasts,
  removeToast,
  type Toast,
  type ToastIngredient,
  type ToastType,
} from './store'

export type { ToastType, ToastIngredient }

export interface ToastOptions {
  type?: ToastType
  ingredient?: ToastIngredient
  isLoading?: boolean
}

// type↔ingredient 매핑의 단일 소스. 이 한 곳만 바뀌면 표준 타입 메서드와
// 재료 메서드 양쪽에 반영된다.
const DEFAULT_INGREDIENT: Record<ToastType, ToastIngredient> = {
  success: 'lettuce',
  error: 'tomato',
  warning: 'cheese',
  info: 'bread',
}

function createToast(message: string, defaultType: ToastType, userOptions?: ToastOptions): string {
  const id = Math.random().toString(36).substring(2, 9)
  const finalToast: Toast = {
    id,
    message,
    type: userOptions?.type ?? defaultType,
    ingredient: userOptions?.ingredient ?? DEFAULT_INGREDIENT[defaultType],
    isLoading: userOptions?.isLoading ?? false,
  }
  addToast(finalToast)
  return id
}

export const toast = {
  // 표준 타입 지향: 시맨틱 의미(성공/실패/경고/정보)로 호출하는, 다른 토스트
  // 라이브러리와 동일한 익숙한 진입점. 접근성 등 "의미"가 중요한 호출부에 맞는다.
  success: (message: string, options?: ToastOptions) => createToast(message, 'success', options),
  error: (message: string, options?: ToastOptions) => createToast(message, 'error', options),
  warning: (message: string, options?: ToastOptions) => createToast(message, 'warning', options),
  info: (message: string, options?: ToastOptions) => createToast(message, 'info', options),

  // 재료 지향: 어떤 그림이 뜰지 먼저 정하고 싶을 때 쓰는 진입점. 기본 defaults는
  // 위 표준 메서드와 동일하지만, "의미"보다 "비주얼"이 우선인 호출부에 맞는다.
  lettuce: (message: string, options?: ToastOptions) => createToast(message, 'success', options),
  tomato: (message: string, options?: ToastOptions) => createToast(message, 'error', options),
  cheese: (message: string, options?: ToastOptions) => createToast(message, 'warning', options),
  bread: (message: string, options?: ToastOptions) => createToast(message, 'info', options),

  // id를 넘기면 해당 토스트만, 안 넘기면 전체 제거
  dismiss: (id?: string) => {
    if (id) removeToast(id)
    else clearToasts()
  },
}
