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

  const { toasts, rankOf, hoveredId, hoveredRank, isSettling, setHoveredId, bringToFront } = useToastStack()
  const isBottom = position.startsWith('bottom')
  const horizontal = position.endsWith('left') ? 'left' : position.endsWith('right') ? 'right' : 'center'
  const containerClassName = ['sandwich-toaster', isBottom ? 'sandwich-toaster--bottom' : 'sandwich-toaster--top', `sandwich-toaster--${horizontal}`].join(' ')

  return (
    <div className={containerClassName} style={{ [SCALE_VAR]: scale } as CSSProperties}>
      {toasts.map((t) => {
        const id = t.id
        const rank = rankOf.get(id) ?? 0
        const offsetRank = isBottom ? toasts.length - 1 - rank : rank
        const isExpanded = hoveredRank >= 0 && (isBottom ? rank < hoveredRank : rank >= hoveredRank)
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
            dismissRequested={t.dismissRequested}
            duration={t.duration}
            isPaused={hoveredId === id}
            liftOffset={isExpanded ? (isBottom ? -EXTRA_LIFT : EXTRA_LIFT) * scale : 0}
            style={
              {
                [isBottom ? 'bottom' : 'top']: offsetRank * RESTING_GAP * scale,
                zIndex: toasts.length - rank,
                pointerEvents: isSettling ? 'none' : undefined,
              } as CSSProperties
            }
          />
        )
      })}
    </div>
  )
}
