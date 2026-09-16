import type { Toast } from './types'

type Listener = () => void

type StoredToast = Toast & { dismissRequested?: boolean }

let toasts: StoredToast[] = []
const listeners = new Set<Listener>()

function emitChange() {
  for (const listener of listeners) listener()
}
export function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      // Strict Mode의 재구독을 기다린 뒤 표시할 곳이 없는 닫기 요청을 정리한다.
      queueMicrotask(() => {
        if (listeners.size !== 0) return
        const nextToasts = toasts.filter((toast) => !toast.dismissRequested)
        if (nextToasts.length !== toasts.length) toasts = nextToasts
      })
    }
  }
}
// 변경이 없으면 같은 배열 참조를 반환한다.
export function getSnapshot(): StoredToast[] {
  return toasts
}

export function addToast(toast: Toast) {
  toasts = [...toasts, toast]
  emitChange()
}

export function requestDismiss(id: string) {
  if (listeners.size === 0) {
    removeToast(id)
    return
  }
  const toast = toasts.find((toast) => toast.id === id)
  if (!toast || toast.dismissRequested) return
  toasts = toasts.map((toast) => toast.id === id ? { ...toast, dismissRequested: true } : toast)
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
