import { useEffect, useRef, useState, type CSSProperties, type MouseEventHandler } from "react";
import type { ToastIngredient } from "../types";
import { bitePolygon, NO_BITES, DISMISS_ANIMATION_MS } from "../dismissBite";
import { Ingredient } from "./Ingredient";
import { useInjectedStyle } from "../injectStyle";
import { LIFT_VAR, INGREDIENT_CLIP_CLASS, INGREDIENT_MESSAGE_CLASS, STYLE_KEY, STYLE_CSS } from "./ToastItem.styles";

export interface ToastItemProps {
  message: string;
  ingredient: ToastIngredient;
  // true면 재료 위에 케찹 애니메이션을 얹는다 — scrambled뿐 아니라 어떤
  // 재료든 로딩 중이면 같은 방식으로 표시된다.
  isLoading?: boolean;
  // 로딩 여부와 무관하게 케찹을 정적으로(애니메이션 없이) 얹고 싶을 때.
  // isLoading이 true면 이 값과 무관하게 항상 애니메이션과 함께 얹힌다.
  ketchup?: boolean;
  // 다른 토스트가 호버됐을 때 이 토스트를 아래로 얼마나 밀어낼지 지정한다
  // (px). CSS 커스텀 속성으로 전달돼서, hover 확대와 함께 CSS
  // 트랜지션으로만 처리된다(리플로우 없음).
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
  // true면 자동 삭제 타이머를 멈춘다 — 사용자가 읽으려고 호버한 토스트가
  // 다 읽기도 전에 사라지면 안 되기 때문. 형제 토스트를 알아야(지금 이
  // 토스트가 호버된 그 토스트인지) 판단할 수 있어서 부모(Toaster)가
  // 계산해서 넘긴다.
  isPaused?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function ToastItem({ message, ingredient, isLoading = false, ketchup = false, liftOffset = 0, onMouseEnter, onMouseLeave, onClick, onDismiss, duration, isPaused = false, className, style }: ToastItemProps) {
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

  // 클릭해서 맨 앞으로 가져오면 duration을 처음부터 다시 센다. 이 카드가
  // 직접 받는 클릭 이벤트로 트리거하므로(아래 handleClick) 호버 상태와는
  // 무관하게 동작한다 — 스택을 가로질러 다른 토스트를 클릭하러 가는 길에
  // 이 토스트를 스쳐 지나가는 것과 완전히 분리된 신호다.
  const [resetSignal, setResetSignal] = useState(0);
  const handleClick: MouseEventHandler<HTMLDivElement> = (e) => {
    setResetSignal((n) => n + 1);
    onClick?.(e);
  };

  // 자동 삭제까지 남은 시간을 "다음 dismiss 예정 시각"(절대 타임스탬프)으로
  // 추적한다 — 그래야 호버로 멈췄다가 다시 풀렸을 때, 멈춰있던 만큼만
  // 시각을 뒤로 미루면 되고(경과한 시간은 그대로 유지) setTimeout을 몇 ms로
  // 다시 걸어야 하는지도 이 값에서 바로 계산된다. 스택이 겹쳐 있어서 다른
  // 토스트로 가는 길에 이 토스트를 잠깐 스쳐 지나가는 것도 실제 호버로
  // 잡히는데, 이 방식이면 그 찰나의 pause는 그만큼만 시각을 미룰 뿐이라
  // 영향이 미미하다 — "언호버 시 무조건 처음부터 다시 시작"이었다면
  // 그 찰나의 스침마저 매번 duration을 통째로 리셋시켜서, 스택을
  // 가로지르기만 해도 지나친 토스트들이 한꺼번에 리셋되는 문제가 있었다.
  const targetTimeRef = useRef(0);
  // 멈춘 시각. 멈춰있지 않으면 null.
  const pauseStartedAtRef = useRef<number | null>(null);
  const prevResetSignalRef = useRef(resetSignal);

  useEffect(() => {
    if (duration === undefined || !Number.isFinite(duration)) return;

    const isReset = resetSignal !== prevResetSignalRef.current;
    prevResetSignalRef.current = resetSignal;

    if (isReset) {
      targetTimeRef.current = Date.now() + duration;
      pauseStartedAtRef.current = isPaused ? Date.now() : null;
    } else if (isPaused) {
      pauseStartedAtRef.current = Date.now();
    } else if (pauseStartedAtRef.current !== null) {
      // 멈췄다 풀린 경우: 멈춰있던 시간만큼 예정 시각을 뒤로 민다.
      targetTimeRef.current += Date.now() - pauseStartedAtRef.current;
      pauseStartedAtRef.current = null;
    } else {
      // 처음 시작하는 경우.
      targetTimeRef.current = Date.now() + duration;
    }

    if (isPaused) return;

    const remaining = Math.max(0, targetTimeRef.current - Date.now());
    const timer = setTimeout(() => handleDismissRef.current(), remaining);
    return () => clearTimeout(timer);
  }, [duration, isPaused, resetSignal]);

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
