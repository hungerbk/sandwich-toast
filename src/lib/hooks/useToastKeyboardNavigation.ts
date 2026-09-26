import type { KeyboardEventHandler } from 'react'

const MESSAGE_BUTTON = '.sandwich-toast-message-button'
const CLOSE_BUTTON = '.sandwich-toast-dismiss-button'
const ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']

interface NavigationToast {
  id: string
  dismissRequested?: boolean
}

function focusButton(card: HTMLElement, selector: string) {
  const button = card.querySelector<HTMLButtonElement>(`${selector}:not(:disabled)`)
  button?.focus({ preventScroll: true })
  return !!button && document.activeElement === button
}

export function useToastKeyboardNavigation(toasts: readonly NavigationToast[], visualOrder: readonly string[]) {
  const canFocusCard = (card: HTMLElement) => {
    const toast = toasts.find((toast) => toast.id === card.dataset.toastId)
    return !!toast && !toast.dismissRequested && !card.classList.contains('sandwich-toast-item--dismissing')
  }

  const moveFocusWithinCard = (card: HTMLElement, key: string) => {
    if (canFocusCard(card)) focusButton(card, key === 'ArrowRight' ? CLOSE_BUTTON : MESSAGE_BUTTON)
  }

  const moveFocusBetweenCards = (container: HTMLElement, currentIndex: number, direction: number) => {
    const cards = new Map(Array.from(container.querySelectorAll<HTMLElement>('[data-toast-id]')).map((card) => [card.dataset.toastId, card]))
    for (let index = currentIndex + direction; index >= 0 && index < visualOrder.length; index += direction) {
      const card = cards.get(visualOrder[index])
      if (card && canFocusCard(card) && focusButton(card, MESSAGE_BUTTON)) return
    }
  }

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.nativeEvent.isComposing) return
    if (!ARROW_KEYS.includes(event.key)) return
    if (!(event.target instanceof HTMLButtonElement) || !event.target.matches(`${MESSAGE_BUTTON}, ${CLOSE_BUTTON}`)) return

    const card = event.target.closest<HTMLElement>('[data-toast-id]')
    if (!card) return
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      moveFocusWithinCard(card, event.key)
      return
    }
    const currentIndex = visualOrder.indexOf(card.dataset.toastId ?? '')
    if (currentIndex < 0) return
    event.preventDefault()
    moveFocusBetweenCards(event.currentTarget, currentIndex, event.key === 'ArrowDown' ? 1 : -1)
  }

  return { handleKeyDown }
}
