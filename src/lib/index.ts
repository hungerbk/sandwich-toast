import {
  addToast,
  clearToasts,
  removeToast,
  type Toast,
  type ToastIngredient,
  type ToastType,
} from './store'
import { Toaster } from './components/Toaster'

export type { ToastType, ToastIngredient }
export { Toaster }

export interface ToastOptions {
  type?: ToastType
  ingredient?: ToastIngredient
  isLoading?: boolean
}

// 표준 메서드(success 등)는 이미 type을 스스로 결정했으므로 options로 다시
// type을 주는 건 모순이라 막는다. ingredient는 자유롭게 덮어쓸 수 있다.
type StandardToastOptions = Omit<ToastOptions, 'type'>
// 재료 메서드(lettuce 등)는 반대로 ingredient를 막고 type만 열어둔다.
// (예: toast.tomato(msg, { type: 'success' }) — 재료는 tomato 유지, 의미만 success로)
type IngredientToastOptions = Omit<ToastOptions, 'ingredient'>

// type↔ingredient 매핑의 단일 소스. 이 한 곳만 바뀌면 표준 타입 메서드와
// 재료 메서드 양쪽에 반영된다.
const DEFAULT_INGREDIENT: Record<ToastType, ToastIngredient> = {
  success: 'lettuce',
  error: 'tomato',
  warning: 'cheese',
  info: 'bread',
}

let toastIdCounter = 0

function createToast(message: string, defaultType: ToastType, userOptions?: ToastOptions): string {
  const id = `toast-${toastIdCounter++}`
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
  success: (message: string, options?: StandardToastOptions) => createToast(message, 'success', options),
  error: (message: string, options?: StandardToastOptions) => createToast(message, 'error', options),
  warning: (message: string, options?: StandardToastOptions) => createToast(message, 'warning', options),
  info: (message: string, options?: StandardToastOptions) => createToast(message, 'info', options),

  // 재료 지향: 어떤 그림이 뜰지 먼저 정하고 싶을 때 쓰는 진입점. 기본 defaults는
  // 위 표준 메서드와 동일하지만, "의미"보다 "비주얼"이 우선인 호출부에 맞는다.
  lettuce: (message: string, options?: IngredientToastOptions) => createToast(message, 'success', options),
  tomato: (message: string, options?: IngredientToastOptions) => createToast(message, 'error', options),
  cheese: (message: string, options?: IngredientToastOptions) => createToast(message, 'warning', options),
  bread: (message: string, options?: IngredientToastOptions) => createToast(message, 'info', options),

  // 인자를 아예 안 넘기면(dismiss()) 전체 삭제. id를 넘겼는데 값이 undefined인
  // 경우(예: toast.dismiss(ref.current)에서 ref.current가 아직 없을 때)는
  // 아무 것도 하지 않는다 — "0개 인자"와 "undefined 인자"를 구분해야 실수로
  // 전체가 삭제되는 걸 막을 수 있다.
  dismiss: (...args: [id?: string]) => {
    if (args.length === 0) {
      clearToasts()
      return
    }
    const [id] = args
    if (id) removeToast(id)
  },
}
