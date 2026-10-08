import { useLayoutEffect, useRef, type FocusEventHandler } from "react";

export function useToastFocus() {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const focusedRef = useRef<{ element: HTMLElement; index: number } | null>(null);

  const onFocusCapture: FocusEventHandler<HTMLDivElement> = (event) => {
    const container = event.currentTarget;
    if (
      !container.contains(event.relatedTarget) &&
      event.relatedTarget instanceof HTMLElement &&
      event.relatedTarget !== document.body
    ) {
      previousFocusRef.current = event.relatedTarget;
    }
    const cards = Array.from(container.querySelectorAll(".sandwich-toast-item"));
    focusedRef.current = {
      element: event.target,
      index: cards.findIndex((card) => card.contains(event.target)),
    };
  };

  const onBlurCapture: FocusEventHandler<HTMLDivElement> = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget) && event.target.isConnected) {
      focusedRef.current = null;
    }
  };

  useLayoutEffect(() => {
    const focused = focusedRef.current;
    const container = containerRef.current;
    if (!focused || !container) return;
    const cards = Array.from(container.querySelectorAll<HTMLElement>(".sandwich-toast-item"));
    if (focused.element.isConnected) {
      focused.index = cards.findIndex((card) => card.contains(focused.element));
      return;
    }

    focusedRef.current = null;
    // 삭제 후 body로 빠진 포커스만 복원하고 사용자가 옮긴 포커스는 유지한다.
    if (document.activeElement !== document.body) return;
    const candidates = [...cards.slice(focused.index), ...cards.slice(0, focused.index).reverse()];
    for (const card of candidates) {
      if (card.classList.contains("sandwich-toast-item--dismissing")) continue;
      const button = card.querySelector<HTMLButtonElement>(
        ".sandwich-toast-message-button:not(:disabled)",
      );
      button?.focus({ preventScroll: true });
      if (button && document.activeElement === button) return;
    }
    if (previousFocusRef.current?.isConnected) {
      previousFocusRef.current.focus({ preventScroll: true });
    }
  });

  return { containerRef, onFocusCapture, onBlurCapture };
}
