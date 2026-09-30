import { useState, type CSSProperties } from 'react'
import { toastLabels } from '../labels'
import { removeToast } from '../store'
import { useToastStack } from '../hooks/useToastStack'
import { useToastKeyboardNavigation } from '../hooks/useToastKeyboardNavigation'
import { useToastFocus } from '../hooks/useToastFocus'
import { ToastItem } from './ToastItem'
import { ToastAnnouncements } from './ToastAnnouncements'
import { useInjectedStyle } from '../injectStyle'
import { SCALE_VAR } from '../scale'
import { STYLE_KEY, STYLE_CSS, EXTRA_LIFT } from './Toaster.styles'
import type { ToasterPosition, ToasterProps } from '../types'

const DEFAULT_POSITION: ToasterPosition = 'top-center'
const DEFAULT_SCALE = 1
const MIN_SCALE = 0.5
const MAX_SCALE = 1.5

const RESTING_GAP = 40
export function Toaster({ position = DEFAULT_POSITION, scale = DEFAULT_SCALE, closeButtonLabel = toastLabels.ko.closeButtonLabel, reorderHint = toastLabels.ko.reorderHint }: ToasterProps) {
  useInjectedStyle(STYLE_KEY, STYLE_CSS)
  const resolvedScale = Number.isFinite(scale) && scale > 0
    ? Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))
    : DEFAULT_SCALE

  const { toasts, visualOrder, rankOf, hoveredId, hoveredRank, isSettling, setHoveredId, bringToFront } = useToastStack()
  const { containerRef, onFocusCapture, onBlurCapture } = useToastFocus()
  const { handleKeyDown } = useToastKeyboardNavigation(toasts, visualOrder)
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const focusedRank = focusedId === null ? -1 : (rankOf.get(focusedId) ?? -1)
  const expandedRank = focusedRank >= 0 ? focusedRank : hoveredRank
  const isBottom = position.startsWith('bottom')
  const horizontal = position.endsWith('left') ? 'left' : position.endsWith('right') ? 'right' : 'center'
  const containerClassName = ['sandwich-toaster', isBottom ? 'sandwich-toaster--bottom' : 'sandwich-toaster--top', `sandwich-toaster--${horizontal}`].join(' ')


  return (
    <div onKeyDown={handleKeyDown} ref={containerRef} onFocusCapture={onFocusCapture} onBlurCapture={onBlurCapture} className={containerClassName} style={{ [SCALE_VAR]: resolvedScale } as CSSProperties}>
      <ToastAnnouncements toasts={toasts} />
      {toasts.map((t) => {
        const id = t.id
        const rank = rankOf.get(id) ?? 0
        const offsetRank = isBottom ? toasts.length - 1 - rank : rank
        const isExpanded = expandedRank >= 0 && (isBottom ? rank < expandedRank : rank >= expandedRank)
        return (
          <ToastItem
            key={id}
            toastId={id}
            ingredient={t.ingredient}
            isLoading={t.type === 'loading'}
            ketchup={t.ketchup}
            message={t.message}
            onMouseEnter={() => setHoveredId(id)}
            onMouseLeave={() => setHoveredId(null)}
            onFocusWithinChange={(focused) => setFocusedId((current) => focused ? id : current === id ? null : current)}
            onClick={() => bringToFront(id)}
            onDismiss={() => removeToast(id)}
            closeButtonLabel={closeButtonLabel}
            reorderHint={reorderHint}
            dismissRequested={t.dismissRequested}
            duration={t.duration}
            isPaused={hoveredId === id}
            liftOffset={isExpanded ? (isBottom ? -EXTRA_LIFT : EXTRA_LIFT) * resolvedScale : 0}
            style={
              {
                [isBottom ? 'bottom' : 'top']: offsetRank * RESTING_GAP * resolvedScale,
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
