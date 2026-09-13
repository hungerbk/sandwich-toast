import { useEffect, useRef, useState, type CSSProperties, type MouseEventHandler } from "react";
import { useToastTimer } from "../hooks/useToastTimer";
import type { ToastIngredient } from "../types";
import { bitePolygon, NO_BITES, DISMISS_ANIMATION_MS } from "../dismissBite";
import { Ingredient } from "./Ingredient";
import { useInjectedStyle } from "../injectStyle";
import { LIFT_VAR, INGREDIENT_CLIP_CLASS, INGREDIENT_MESSAGE_CLASS, STYLE_KEY, STYLE_CSS } from "./ToastItem.styles";

export interface ToastItemProps {
  message: string;
  ingredient: ToastIngredient;
  isLoading?: boolean;
  ketchup?: boolean;
  liftOffset?: number;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;
  onClick?: MouseEventHandler<HTMLDivElement>;
  onDismiss?: () => void;
  duration?: number;
  isPaused?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function ToastItem({ message, ingredient, isLoading = false, ketchup = false, liftOffset = 0, onMouseEnter, onMouseLeave, onClick, onDismiss, duration, isPaused = false, className, style }: ToastItemProps) {
  useInjectedStyle(STYLE_KEY, STYLE_CSS);

  const [isDismissing, setIsDismissing] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const dismissAnimationRef = useRef<Animation | null>(null);
  // 수동 닫기와 자동 종료가 겹쳐도 애니메이션은 한 번만 실행한다.
  const dismissedRef = useRef(false);

  useEffect(() => {
    return () => {
      const animation = dismissAnimationRef.current;
      if (animation) {
        animation.onfinish = null;
        animation.cancel();
        dismissAnimationRef.current = null;
      }
    };
  }, []);

  const handleDismiss = () => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setIsDismissing(true);

    const el = rootRef.current;
    // Web Animations 미지원 환경에서는 즉시 삭제한다.
    if (!el || typeof el.animate !== "function") {
      onDismiss?.();
      return;
    }
    const animation = el.animate(
      [
        { clipPath: NO_BITES, opacity: 1, offset: 0 },
        { clipPath: bitePolygon({ top: false, right: true, bottom: false, left: false }), opacity: 1, offset: 0.22 },
        { clipPath: bitePolygon({ top: true, right: true, bottom: false, left: false }), opacity: 1, offset: 0.44 },
        { clipPath: bitePolygon({ top: true, right: true, bottom: true, left: false }), opacity: 1, offset: 0.66 },
        { clipPath: bitePolygon({ top: true, right: true, bottom: true, left: true }), opacity: 1, offset: 0.82 },
        { clipPath: bitePolygon({ top: true, right: true, bottom: true, left: true }), opacity: 0, offset: 1 },
      ],
      { duration: DISMISS_ANIMATION_MS, easing: "ease-out" },
    );
    dismissAnimationRef.current = animation;
    animation.onfinish = () => {
      animation.onfinish = null;
      dismissAnimationRef.current = null;
      onDismiss?.();
    };
  };

  const { resetTimer } = useToastTimer({ duration, isPaused, onElapsed: handleDismiss });
  const handleClick: MouseEventHandler<HTMLDivElement> = (e) => {
    resetTimer();
    onClick?.(e);
  };

  const rootClassName = ["sandwich-toast-item", onClick && "sandwich-toast-item--clickable", isDismissing && "sandwich-toast-item--dismissing", INGREDIENT_CLIP_CLASS[ingredient], className]
    .filter(Boolean)
    .join(" ");
  const messageClassName = ["sandwich-toast-message", INGREDIENT_MESSAGE_CLASS[ingredient]].filter(Boolean).join(" ");

  return (
    <div
      ref={rootRef}
      className={rootClassName}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={handleClick}
      style={{ [LIFT_VAR]: `${liftOffset}px`, ...style } as CSSProperties}>
      <Ingredient ingredient={ingredient} isLoading={isLoading} ketchup={ketchup} />

      <p className={messageClassName}>
        <span className="sandwich-toast-message-text">{message}</span>
      </p>

      {onDismiss && (
        <button
          type="button"
          aria-label="닫기"
          className="sandwich-toast-dismiss-button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}>
          ×
        </button>
      )}
    </div>
  );
}
