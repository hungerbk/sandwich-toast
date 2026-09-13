import { useRef, useState, useSyncExternalStore } from 'react'
import { subscribe, getSnapshot } from '../store'
import { TOAST_ITEM_TRANSITION_MS } from '../components/ToastItem.styles'

const SETTLE_MS = TOAST_ITEM_TRANSITION_MS + 20

export function useToastStack() {
  const toasts = useSyncExternalStore(subscribe, getSnapshot)
  // DOM 순서는 유지하고 시각적 순서는 priority로 계산한다.
  const [order, setOrder] = useState<string[]>(() => toasts.map((t) => t.id))
  const [priority, setPriority] = useState<Record<string, number>>(() => Object.fromEntries(toasts.map((t, i) => [t.id, i])))
  const prioritySeqRef = useRef(toasts.length)

  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [isSettling, setIsSettling] = useState(false)
  // 새 토스트가 첫 커밋에서 빠지지 않도록 렌더 중 목록을 동기화한다.
  const [prevToasts, setPrevToasts] = useState(toasts)
  if (toasts !== prevToasts) {
    setPrevToasts(toasts)
    const currentIds = new Set(toasts.map((t) => t.id))
    const kept = order.filter((id) => currentIds.has(id))
    const newIds = toasts.map((t) => t.id).filter((id) => !order.includes(id))
    setOrder([...kept, ...newIds])
    if (newIds.length > 0 || kept.length !== order.length) {
      const nextPriority = Object.fromEntries(kept.map((id) => [id, priority[id]]))
      for (const id of newIds) {
        nextPriority[id] = ++prioritySeqRef.current
      }
      setPriority(nextPriority)
    }
    if (hoveredId !== null && !currentIds.has(hoveredId)) {
      setHoveredId(null)
    }
  }
  const visualOrder = [...order].sort((a, b) => (priority[b] ?? 0) - (priority[a] ?? 0))
  const rankOf = new Map(visualOrder.map((id, i) => [id, i]))

  const hoveredRank = hoveredId ? (rankOf.get(hoveredId) ?? -1) : -1

  const bringToFront = (id: string) => {
    setHoveredId(null)
    setIsSettling(true)
    setPriority((prev) => ({ ...prev, [id]: ++prioritySeqRef.current }))
    setTimeout(() => setIsSettling(false), SETTLE_MS)
  }

  return { toasts, order, rankOf, hoveredId, hoveredRank, isSettling, setHoveredId, bringToFront }
}
