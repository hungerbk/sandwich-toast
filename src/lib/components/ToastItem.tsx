import { useEffect, useRef, useState, type CSSProperties, type MouseEventHandler } from "react";
import type { ToastIngredient } from "../store";
import { bitePolygon, NO_BITES, DISMISS_ANIMATION_MS } from "../dismissBite";
import { Ingredient } from "./Ingredient";
import { useInjectedStyle } from "../injectStyle";
import { LIFT_VAR, INGREDIENT_CLIP_CLASS, INGREDIENT_MESSAGE_CLASS, STYLE_KEY, STYLE_CSS } from "./ToastItem.styles";

export interface ToastItemProps {
  message: string;
  ingredient: ToastIngredient;
  // 호버 시 위 레이어들이 들리는 연출을 위해 부모(Toaster)가 위로 얼마나
  // 밀어 올릴지 지정한다 (px). CSS 커스텀 속성으로 전달돼서, hover 확대와
  // 함께 CSS 트랜지션으로만 처리된다(리플로우 없음).
  liftOffset?: number;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;
  // 클릭해서 스택 맨 앞으로 가져오는 동작. z-index/liftOffset 계산은
  // 형제 토스트를 알아야 해서 부모(Toaster)가 담당하고, ToastItem은
  // 클릭 이벤트만 그대로 전달한다.
  onClick?: MouseEventHandler<HTMLDivElement>;
  // 지정하면 우상단에 삭제(X) 버튼이 뜨고, 베어 물린 듯한 애니메이션이
  // 끝난 뒤 호출된다. 실제로 store에서 지우는 건 호출하는 쪽(Toaster) 책임.
  onDismiss?: () => void;
  // ms. 지정하면 그 시간 뒤 onDismiss와 똑같은 애니메이션으로 자동
  // 삭제된다. Infinity/미지정이면 자동 삭제하지 않는다(로딩 토스트 등).
  duration?: number;
  className?: string;
  style?: CSSProperties;
}

export function ToastItem({ message, ingredient, liftOffset = 0, onMouseEnter, onMouseLeave, onClick, onDismiss, duration, className, style }: ToastItemProps) {
  useInjectedStyle(STYLE_KEY, STYLE_CSS);

  const [isDismissing, setIsDismissing] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  // isDismissing(state)은 렌더링(pointer-events 등)에 쓰이지만, 중복 실행
  // 방지 가드로 쓰기엔 부적합하다 — 아래 자동 삭제 타이머의 클로저가
  // 마운트 시점의 오래된(stale) isDismissing 값을 계속 들고 있어서,
  // 수동으로 먼저 닫아도 타이머가 나중에 또 실행돼버릴 수 있다. ref는
  // 항상 최신값을 읽으므로 이 가드에는 ref를 쓴다.
  const dismissedRef = useRef(false);

  const handleDismiss = () => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setIsDismissing(true);

    const el = rootRef.current;
    // jsdom(Jest/Vitest 테스트 환경)이나 구형 브라우저엔 Web Animations
    // API가 없을 수 있다 — 그런 경우 애니메이션 없이 바로 dismiss.
    if (!el || typeof el.animate !== "function") {
      onDismiss?.();
      return;
    }
    const F = false;
    const T = true;
    const animation = el.animate(
      [
        { clipPath: NO_BITES, opacity: 1, offset: 0 },
        { clipPath: bitePolygon({ top: F, right: T, bottom: F, left: F }), opacity: 1, offset: 0.22 },
        { clipPath: bitePolygon({ top: T, right: T, bottom: F, left: F }), opacity: 1, offset: 0.44 },
        { clipPath: bitePolygon({ top: T, right: T, bottom: T, left: F }), opacity: 1, offset: 0.66 },
        { clipPath: bitePolygon({ top: T, right: T, bottom: T, left: T }), opacity: 1, offset: 0.82 },
        { clipPath: bitePolygon({ top: T, right: T, bottom: T, left: T }), opacity: 0, offset: 1 },
      ],
      { duration: DISMISS_ANIMATION_MS, easing: "ease-out" },
    );
    animation.onfinish = () => onDismiss?.();
  };

  // 렌더마다 handleDismiss가 새로 만들어지므로, 이 함수를 effect의
  // dependency로 넣으면 매 렌더마다 타이머가 리셋돼서 영영 안 울린다.
  // 그렇다고 deps를 비워서 첫 렌더의 handleDismiss를 그대로 굳혀버리면
  // 클로저가 오래된 props를 참조하게 된다. ref에 최신 함수를 담아두고
  // effect 안에서는 ref로만 호출하면 두 문제 다 피할 수 있다.
  // ref.current 갱신 자체도 렌더링 도중이 아니라 커밋 이후(effect)에
  // 해야 한다 — 렌더 도중 ref를 직접 mutate하면, 그 렌더가 커밋되지
  // 않고 버려지는 경우(concurrent 기능 사용 시)에도 mutation은 되돌려지지
  // 않아서 실제 화면과 ref가 어긋날 수 있다. deps 없는 effect는 매
  // 커밋 후 실행되므로 duration effect와 별개로 항상 최신 상태를 유지한다.
  const handleDismissRef = useRef(handleDismiss);
  useEffect(() => {
    handleDismissRef.current = handleDismiss;
  });

  useEffect(() => {
    if (duration === undefined || !Number.isFinite(duration)) return;
    const timer = setTimeout(() => handleDismissRef.current(), duration);
    return () => clearTimeout(timer);
  }, [duration]);

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
      onClick={onClick}
      style={{ [LIFT_VAR]: `${liftOffset}px`, ...style } as CSSProperties}>
      <Ingredient ingredient={ingredient} />

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
