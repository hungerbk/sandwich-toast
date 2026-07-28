import { useRef, useState, useSyncExternalStore } from 'react'
import { subscribe, getSnapshot, removeToast } from '../store'
import { ToastItem } from './ToastItem'
import { TOAST_ITEM_TRANSITION_MS } from './ToastItem.styles'
import { useInjectedStyle } from '../injectStyle'
import { STYLE_KEY, STYLE_CSS } from './Toaster.styles'

const RESTING_GAP = 40
const EXTRA_LIFT = 70
// 재정렬(클릭으로 맨 앞 이동) 애니메이션이 끝날 때까지 호버 반응을 막는
// 대기시간. ToastItem의 트랜지션 시간에 약간의 여유를 더한다.
const SETTLE_MS = TOAST_ITEM_TRANSITION_MS + 20

export function Toaster() {
  useInjectedStyle(STYLE_KEY, STYLE_CSS)

  const toasts = useSyncExternalStore(subscribe, getSnapshot)

  // order는 순전히 리액트 리스트 렌더링용 "존재하는 토스트 id 목록"이고,
  // 추가/삭제될 때만 바뀐다 — 클릭으로 맨 앞에 가져와도 이 배열 자체의
  // 순서는 절대 바꾸지 않는다. 화면 표시 순서(맨 앞이 어느 토스트인지)는
  // 아래 priority로 별도 계산한다.
  //
  // 예전엔 order 배열 자체를 재정렬해서 화면 순서를 표현했는데, 배열의
  // 첫 요소가 바뀌는 재정렬을 하면 React가(StrictMode에서, 실제
  // 프로덕션 빌드에서도 재현됨) 위치 이동이 아니라 언마운트 후
  // 리마운트로 처리하는 경우가 있었다 — 그 바람에 재정렬로 밀려난
  // 다른 토스트들의 로컬 state(자동 삭제 타이머 등)가 전부 초기화돼서,
  // 하나를 맨 앞으로 가져올 때마다 나머지가 다같이 리셋되는 버그가
  // 있었다. order 배열의 순서 자체를 절대 바꾸지 않으면 이 문제가
  // 원천적으로 생기지 않는다.
  const [order, setOrder] = useState<string[]>(() => toasts.map((t) => t.id))
  const [priority, setPriority] = useState<Record<string, number>>(() => Object.fromEntries(toasts.map((t, i) => [t.id, i])))
  // priority에 쓸 다음 값. 클릭하거나 새 토스트가 추가될 때마다 하나씩
  // 올려서, 항상 "가장 최근에 앞으로 온(또는 도착한) 토스트가 가장 크다"를
  // 유지한다.
  const prioritySeqRef = useRef(toasts.length)

  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [isSettling, setIsSettling] = useState(false)

  // toasts가 바뀐 뒤에 useEffect로 order를 동기화하면, 새 토스트가 아직
  // order에 없는 채로 한 번 렌더 및 페인트된 다음에야(그 프레임엔 새
  // 토스트가 안 보임) effect가 실행되어 다시 렌더링되는 깜빡임이 생긴다.
  // 렌더링 도중 상태를 바로 맞추면(React 공식 문서의 "Adjusting state
  // when a prop changes" 패턴) 커밋 전에 다시 렌더링돼서 깜빡임 없이 첫
  // 프레임부터 정확하다.
  const [prevToasts, setPrevToasts] = useState(toasts)
  if (toasts !== prevToasts) {
    setPrevToasts(toasts)
    const currentIds = new Set(toasts.map((t) => t.id))
    const kept = order.filter((id) => currentIds.has(id))
    const newIds = toasts.map((t) => t.id).filter((id) => !order.includes(id))
    setOrder([...kept, ...newIds])
    if (newIds.length > 0) {
      const nextPriority = { ...priority }
      for (const id of newIds) {
        nextPriority[id] = ++prioritySeqRef.current
      }
      setPriority(nextPriority)
    }
  }

  // 화면 표시 순서(맨 앞이 rank 0)는 priority가 큰 순.
  const visualOrder = [...order].sort((a, b) => (priority[b] ?? 0) - (priority[a] ?? 0))
  const rankOf = new Map(visualOrder.map((id, i) => [id, i]))

  const hoveredRank = hoveredId ? (rankOf.get(hoveredId) ?? -1) : -1

  const bringToFront = (id: string) => {
    setHoveredId(null)
    setIsSettling(true)
    setPriority((prev) => ({ ...prev, [id]: ++prioritySeqRef.current }))
    setTimeout(() => setIsSettling(false), SETTLE_MS)
  }

  return (
    <div className="sandwich-toaster">
      {order.map((id) => {
        const t = toasts.find((toast) => toast.id === id)
        if (!t) return null
        const rank = rankOf.get(id) ?? 0
        return (
          <ToastItem
            key={id}
            ingredient={t.ingredient}
            message={t.message}
            onMouseEnter={() => setHoveredId(id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => bringToFront(id)}
            onDismiss={() => removeToast(id)}
            duration={t.duration}
            isPaused={hoveredId === id}
            liftOffset={hoveredRank >= 0 && rank < hoveredRank ? EXTRA_LIFT : 0}
            style={{
              top: rank * RESTING_GAP,
              zIndex: order.length - rank,
              pointerEvents: isSettling ? 'none' : undefined,
            }}
          />
        )
      })}
    </div>
  )
}
