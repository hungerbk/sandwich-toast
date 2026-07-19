import { useEffect, useState, useSyncExternalStore } from 'react'
import { subscribe, getSnapshot, removeToast } from '../store'
import { ToastItem, TOAST_ITEM_TRANSITION_MS, TOAST_ITEM_WIDTH } from './ToastItem'

const RESTING_GAP = 40
const EXTRA_LIFT = 70
// 재정렬(클릭으로 맨 앞 이동) 애니메이션이 끝날 때까지 호버 반응을 막는
// 대기시간. ToastItem의 트랜지션 시간에 약간의 여유를 더한다.
const SETTLE_MS = TOAST_ITEM_TRANSITION_MS + 20

export function Toaster() {
  const toasts = useSyncExternalStore(subscribe, getSnapshot)

  // 화면에 보여줄 순서(맨 앞이 index 0). store의 toasts 배열은 그냥
  // 도착 순서일 뿐이고, 클릭으로 "맨 앞으로" 가져온 순서는 여기서 별도로
  // 관리한다 — store 자체를 건드리면 도착 순서(데이터)와 화면 표시
  // 순서(UI)가 뒤섞인다.
  const [order, setOrder] = useState<string[]>([])
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [isSettling, setIsSettling] = useState(false)

  useEffect(() => {
    setOrder((prevOrder) => {
      const currentIds = new Set(toasts.map((t) => t.id))
      const kept = prevOrder.filter((id) => currentIds.has(id))
      // store에 새로 추가됐지만 아직 order에 없는 것들 — 도착 순서를
      // 유지한 채로 맨 앞에 놓는다 (나중에 온 게 더 앞).
      const newIds = toasts.map((t) => t.id).filter((id) => !prevOrder.includes(id))
      return [...newIds.reverse(), ...kept]
    })
  }, [toasts])

  const hoveredRank = hoveredId ? order.indexOf(hoveredId) : -1

  const bringToFront = (id: string) => {
    setHoveredId(null)
    setIsSettling(true)
    setOrder((prev) => [id, ...prev.filter((x) => x !== id)])
    setTimeout(() => setIsSettling(false), SETTLE_MS)
  }

  return (
    // top:0 근처(맨 앞 토스트)가 화면 정중앙에 오도록 left:50% +
    // translateX(-50%)로 잡는다. 자식들은 이 컨테이너 기준 absolute라서
    // 컨테이너 자체에 TOAST_ITEM_WIDTH를 명시해야 translateX(-50%)가
    // 카드 폭 기준으로 정확히 중앙 정렬된다.
    <div style={{ position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', width: TOAST_ITEM_WIDTH, zIndex: 2147483647 }}>
      {order.map((id, rank) => {
        const t = toasts.find((toast) => toast.id === id)
        if (!t) return null
        return (
          <ToastItem
            key={id}
            ingredient={t.ingredient}
            message={t.message}
            onMouseEnter={() => setHoveredId(id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => bringToFront(id)}
            onDismiss={() => removeToast(id)}
            liftOffset={hoveredRank >= 0 && rank < hoveredRank ? EXTRA_LIFT : 0}
            style={{
              position: 'absolute',
              top: rank * RESTING_GAP,
              left: 0,
              zIndex: order.length - rank,
              pointerEvents: isSettling ? 'none' : undefined,
            }}
          />
        )
      })}
    </div>
  )
}
