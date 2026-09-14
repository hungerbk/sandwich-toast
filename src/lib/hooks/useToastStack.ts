import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { subscribe, getSnapshot } from '../store'
import { TOAST_ITEM_TRANSITION_MS } from '../components/ToastItem.styles'

const SETTLE_MS = TOAST_ITEM_TRANSITION_MS + 20

export function useToastStack() {
  const toasts = useSyncExternalStore(subscribe, getSnapshot)
  // DOM 순서는 스토어를 따르고, 화면에 쌓이는 순서만 별도로 관리한다.
  const [visualOrder, setVisualOrder] = useState<string[]>(() => toasts.map((t) => t.id).reverse())
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearSettleTimer = useCallback(() => {
    if (settleTimerRef.current !== null) {
      clearTimeout(settleTimerRef.current)
      settleTimerRef.current = null
    }
  }, [])

  useEffect(() => clearSettleTimer, [clearSettleTimer])

  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [isSettling, setIsSettling] = useState(false)
  // 새 토스트가 첫 화면 반영에서 누락되지 않도록 렌더 중 목록을 동기화한다.
  const [prevToasts, setPrevToasts] = useState(toasts)
  if (toasts !== prevToasts) {
    setPrevToasts(toasts)
    const currentIds = new Set(toasts.map((t) => t.id))
    const previousIds = new Set(visualOrder)
    const kept = visualOrder.filter((id) => currentIds.has(id))
    const newIds = toasts.map((t) => t.id).filter((id) => !previousIds.has(id))
    setVisualOrder([...newIds.reverse(), ...kept])
    if (hoveredId !== null && !currentIds.has(hoveredId)) {
      setHoveredId(null)
    }
  }
  const rankOf = new Map(visualOrder.map((id, i) => [id, i]))

  const hoveredRank = hoveredId ? (rankOf.get(hoveredId) ?? -1) : -1

  const bringToFront = (id: string) => {
    setHoveredId(null)
    setIsSettling(true)
    setVisualOrder((prev) => [id, ...prev.filter((toastId) => toastId !== id)])
    clearSettleTimer()
    settleTimerRef.current = setTimeout(() => {
      settleTimerRef.current = null
      setIsSettling(false)
    }, SETTLE_MS)
  }

  return { toasts, rankOf, hoveredId, hoveredRank, isSettling, setHoveredId, bringToFront }
}
