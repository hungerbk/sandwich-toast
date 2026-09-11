import type { CSSProperties } from 'react'
import { removeToast } from '../store'
import { useToastStack } from '../hooks/useToastStack'
import { ToastItem } from './ToastItem'
import { useInjectedStyle } from '../injectStyle'
import { SCALE_VAR } from '../scale'
import { STYLE_KEY, STYLE_CSS, EXTRA_LIFT } from './Toaster.styles'
import type { ToasterPosition, ToasterProps } from '../types'

const DEFAULT_POSITION: ToasterPosition = 'top-center'
const DEFAULT_SCALE = 1

const RESTING_GAP = 40
export function Toaster({ position = DEFAULT_POSITION, scale = DEFAULT_SCALE }: ToasterProps) {
  useInjectedStyle(STYLE_KEY, STYLE_CSS)

  const { toasts, order, rankOf, hoveredId, hoveredRank, isSettling, setHoveredId, bringToFront } = useToastStack()

  // position의 앞부분(top/bottom)이 스택이 화면 가장자리로부터 어느
  // 방향으로 쌓이는지, 뒷부분(left/center/right)이 가로 정렬을 정한다.
  const isBottom = position.startsWith('bottom')
  const horizontal = position.endsWith('left') ? 'left' : position.endsWith('right') ? 'right' : 'center'
  const containerClassName = ['sandwich-toaster', isBottom ? 'sandwich-toaster--bottom' : 'sandwich-toaster--top', `sandwich-toaster--${horizontal}`].join(' ')

  return (
    <div className={containerClassName} style={{ [SCALE_VAR]: scale } as CSSProperties}>
      {order.map((id) => {
        const t = toasts.find((toast) => toast.id === id)
        if (!t) return null
        const rank = rankOf.get(id) ?? 0
        return (
          <ToastItem
            key={id}
            ingredient={t.ingredient}
            isLoading={t.type === 'loading'}
            ketchup={t.ketchup}
            message={t.message}
            onMouseEnter={() => setHoveredId(id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => bringToFront(id)}
            onDismiss={() => removeToast(id)}
            duration={t.duration}
            isPaused={hoveredId === id}
            // 호버된 토스트 자신도 뒤에 있는 것들과 함께 밀려난다 — 그래야
            // 앞쪽(z-index가 더 높은) 토스트와 겹치지 않는 위치로 이동하면서
            // 자연스럽게 드러난다. 호버된 토스트가 제자리에 그대로 있으면
            // (:hover scale로만 커지면) z-index가 더 높은 앞쪽 토스트에
            // 가려진 채로 커지기만 해서 peek 효과가 안 보인다 — top/bottom
            // 둘 다 이동해야 하는 이유가 같다.
            liftOffset={hoveredRank >= 0 && rank >= hoveredRank ? (isBottom ? -EXTRA_LIFT : EXTRA_LIFT) * scale : 0}
            style={
              {
                [isBottom ? 'bottom' : 'top']: rank * RESTING_GAP * scale,
                zIndex: order.length - rank,
                pointerEvents: isSettling ? 'none' : undefined,
              } as CSSProperties
            }
          />
        )
      })}
    </div>
  )
}
