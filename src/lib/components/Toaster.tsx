import { useState, type CSSProperties, type KeyboardEventHandler } from 'react'
import { toastLabels } from '../labels'
import { removeToast } from '../store'
import { useToastStack } from '../hooks/useToastStack'
import { useToastFocus } from '../hooks/useToastFocus'
import { ToastItem } from './ToastItem'
import { ToastAnnouncements } from './ToastAnnouncements'
import { useInjectedStyle } from '../injectStyle'
import { SCALE_VAR } from '../scale'
import { STYLE_KEY, STYLE_CSS, EXTRA_LIFT } from './Toaster.styles'
import type { ToasterPosition, ToasterProps } from '../types'

const DEFAULT_POSITION: ToasterPosition = 'top-center'
const DEFAULT_SCALE = 1

const RESTING_GAP = 40
export function Toaster({ position = DEFAULT_POSITION, scale = DEFAULT_SCALE, closeButtonLabel = toastLabels.ko.closeButtonLabel, reorderHint = toastLabels.ko.reorderHint }: ToasterProps) {
  useInjectedStyle(STYLE_KEY, STYLE_CSS)

  const { toasts, rankOf, hoveredId, hoveredRank, isSettling, setHoveredId, bringToFront } = useToastStack()
  const { containerRef, onFocusCapture, onBlurCapture } = useToastFocus()
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const focusedRank = focusedId === null ? -1 : (rankOf.get(focusedId) ?? -1)
  const expandedRank = focusedRank >= 0 ? focusedRank : hoveredRank
  const isBottom = position.startsWith('bottom')
  const horizontal = position.endsWith('left') ? 'left' : position.endsWith('right') ? 'right' : 'center'
  const containerClassName = ['sandwich-toaster', isBottom ? 'sandwich-toaster--bottom' : 'sandwich-toaster--top', `sandwich-toaster--${horizontal}`].join(' ')

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.nativeEvent.isComposing) return
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
    if (!(event.target instanceof HTMLButtonElement) || !event.target.matches('.sandwich-toast-message-button, .sandwich-toast-dismiss-button')) return

    const currentCard = event.target.closest<HTMLElement>('[data-toast-id]')
    const orderedToasts = [...toasts].sort((a, b) => (rankOf.get(a.id) ?? 0) - (rankOf.get(b.id) ?? 0))
    const currentIndex = orderedToasts.findIndex((toast) => toast.id === currentCard?.dataset.toastId)
    if (currentIndex < 0) return
    event.preventDefault()
    const cards = new Map(Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[data-toast-id]')).map((card) => [card.dataset.toastId, card]))
    const direction = event.key === 'ArrowDown' ? 1 : -1
    for (let index = currentIndex + direction; index >= 0 && index < orderedToasts.length; index += direction) {
      const toast = orderedToasts[index]
      const card = cards.get(toast.id)
      if (toast.dismissRequested || !card || card.classList.contains('sandwich-toast-item--dismissing')) continue
      const button = card.querySelector<HTMLButtonElement>('.sandwich-toast-message-button:not(:disabled)')
      button?.focus({ preventScroll: true })
      if (button && document.activeElement === button) return
    }
  }

  return (
    <div onKeyDown={handleKeyDown} ref={containerRef} onFocusCapture={onFocusCapture} onBlurCapture={onBlurCapture} className={containerClassName} style={{ [SCALE_VAR]: scale } as CSSProperties}>
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
