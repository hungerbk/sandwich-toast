import { useEffect, useState } from 'react'
import type { Toast } from '../types'

export function ToastAnnouncements({ toasts }: { toasts: readonly Toast[] }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // 빈 live region이 먼저 반영된 뒤 초기 메시지를 추가한다.
    const timer = setTimeout(() => setReady(true), 0)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="sandwich-toast-announcements">
      <div role="status" aria-atomic="false" aria-relevant="additions text">
        {ready && toasts.filter((toast) => toast.type !== 'error').map((toast) => (
          <div key={toast.id} aria-atomic="true">{toast.message}</div>
        ))}
      </div>
      <div role="alert" aria-atomic="false" aria-relevant="additions text">
        {ready && toasts.filter((toast) => toast.type === 'error').map((toast) => (
          <div key={toast.id} aria-atomic="true">{toast.message}</div>
        ))}
      </div>
    </div>
  )
}
