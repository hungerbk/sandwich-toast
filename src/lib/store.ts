export type ToastType = 'success' | 'error' | 'warning' | 'info'
export type ToastIngredient = 'lettuce' | 'tomato' | 'cheese' | 'bread'

export interface Toast {
  id: string
  message: string
  type: ToastType
  ingredient: ToastIngredient
  isLoading: boolean
  // ms. Infinity면 자동으로 사라지지 않는다(로딩 토스트 기본값).
  duration: number
}

type Listener = () => void

let toasts: Toast[] = []
const listeners = new Set<Listener>()

function emitChange() {
  for (const listener of listeners) listener()
}

// useSyncExternalStore(subscribe, getSnapshot)의 subscribe로 쓰인다.
// React가 구독 해제 시 실행할 cleanup 함수를 동기적으로 반환해야 하는 계약이라,
// 이걸 안 지키면 언마운트된 컴포넌트의 리스너가 listeners Set에 계속 남아
// 메모리 누수로 이어진다.
export function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// useSyncExternalStore(subscribe, getSnapshot)의 getSnapshot으로 쓰인다.
// subscribe 콜백(emitChange)이 호출될 때마다 React가 다시 호출해 이전 값과
// Object.is로 비교하므로, 변경이 없을 땐 반드시 같은 배열 참조를 반환해야
// 불필요한/무한 리렌더링을 피할 수 있다.
export function getSnapshot(): Toast[] {
  return toasts
}

export function addToast(toast: Toast) {
  toasts = [...toasts, toast]
  emitChange()
}

export function removeToast(id: string) {
  const nextToasts = toasts.filter((toast) => toast.id !== id)
  if (nextToasts.length === toasts.length) return
  toasts = nextToasts
  emitChange()
}

export function clearToasts() {
  if (toasts.length === 0) return
  toasts = []
  emitChange()
}
