import { useEffect, useRef, useState, type CSSProperties, type MouseEventHandler } from "react";
import type { ToastIngredient } from "../store";
import { bitePolygon, NO_BITES, DISMISS_ANIMATION_MS } from "../dismissBite";
import { Ingredient } from "./Ingredient";

export const TOAST_ITEM_WIDTH = 320;

// 위치(top)/리프트(transform) 이동에 쓰는 트랜지션 시간. 부모가 호버/클릭
// 애니메이션이 끝나는 시점을 알아야 할 때(예: 재정렬 중 호버 억제) 이
// 값을 기준으로 계산하도록 export한다.
export const TOAST_ITEM_TRANSITION_MS = 320;

// 재료 한 행(TARGET_ROW_HEIGHT=110px)이면 2줄 정도의 메시지는 여유
// 있게 담긴다 — 그래서 재료를 여러 행으로 쌓지 않고 항상 기본 1행으로
// 고정하고, 메시지를 2줄로 제한한다. 예전에는 메시지 길이에 따라 재료
// 행 수를 늘리는 동적 계산(rowsForContentHeight)이 있었지만, 재료마다
// 실제 렌더링 높이가 다르고(과거 버그) 겹침 비율까지 얽혀서 계산이
// 쉽게 어긋났다 — 메시지를 2줄로 짧게 제한하면 그 복잡도 자체가
// 필요 없어진다.
const MAX_MESSAGE_LINES = 2;

// 메시지 상하/좌우 padding.
const MESSAGE_PADDING_Y = 18;
const MESSAGE_PADDING_X = 28;

// 재료마다 이미지 구도(글자가 놓일 안전한 영역)가 달라서 메시지 스타일을
// 일괄 적용할 수 없다 — HOVER_CLIP_PATH와 같은 방식으로 재료별 예외를
// 여기 매핑해서 기본 스타일 위에 덮어쓴다. tomato는 기본값 그대로 괜찮아서
// 항목이 없다.
const MESSAGE_STYLE_OVERRIDES: Partial<Record<ToastIngredient, CSSProperties>> = {
  lettuce: { paddingLeft: "40px" },
  bread: { paddingLeft: "40px", transform: "translateY(-4px)" },
  cheese: { transform: "translateY(-8px)" },
};

// 재료 그림이 사각형 박스를 꽉 채우지 않으면, 빈 모서리가 마우스 이벤트를
// 가로채서 뒤에 쌓인 다른 토스트를 호버하기 어렵게 만든다. 그 모서리만큼
// 카드 자체를 clip-path로 잘라내 이벤트가 통과하도록 한다. 이미지 실루엣에
// 정확히 맞출 필요는 없고, 문제가 되는 영역만 대략 잘라낸다.
const HOVER_CLIP_PATH: Partial<Record<ToastIngredient, string>> = {
  // 상추는 좌하-우상 대각선으로 그려져 있어 우하단 모서리가 비어있다.
  lettuce: "polygon(15% 0%, 100% 0%, 100% 58%, 58% 100%, 0% 100%)",
  // 토마토는 원형에 가까워 네 모서리가 다 비어있다.
  tomato: "polygon(19% 0%, 81% 0%, 100% 20%, 100% 81%, 81% 100%, 18% 100%, 0% 81%, 0% 19%)",
  // 치즈는 사각형에 가깝지만 모서리가 둥글게 깎여있어 살짝만 잘라낸다.
  cheese: "polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)",
  // bread는 캔버스를 거의 꽉 채워서 clip이 필요 없다.
};

export interface ToastItemProps {
  message: string;
  ingredient: ToastIngredient;
  // 호버 시 위 레이어들이 들리는 연출을 위해 부모(Toaster)가 위로 얼마나
  // 밀어 올릴지 지정한다 (px). 레이아웃 이동은 transform+transition으로만
  // 처리해 리플로우 없이 CSS가 담당한다.
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
  // 재료별 예외 스타일(MESSAGE_STYLE_OVERRIDES)은 텍스트 위치만 조정한다.
  const messageStyleOverride = MESSAGE_STYLE_OVERRIDES[ingredient];

  // 형제 토스트를 위해 비켜서는 것(liftOffset)과 달리, "내가 호버됐을 때
  // 커지는" 건 다른 토스트를 몰라도 되는 자기 완결적 동작이라 내부에서
  // 처리한다.
  const [isSelfHovered, setIsSelfHovered] = useState(false);
  const [isDismissButtonHovered, setIsDismissButtonHovered] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  // isDismissing(state)은 렌더링(pointerEvents 등)에 쓰이지만, 중복 실행
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
  const handleDismissRef = useRef(handleDismiss);
  handleDismissRef.current = handleDismiss;

  useEffect(() => {
    if (duration === undefined || !Number.isFinite(duration)) return;
    const timer = setTimeout(() => handleDismissRef.current(), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <div
      ref={rootRef}
      className={className}
      onMouseEnter={(e) => {
        setIsSelfHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setIsSelfHovered(false);
        onMouseLeave?.(e);
      }}
      onClick={onClick}
      style={{
        position: "relative",
        width: TOAST_ITEM_WIDTH,
        cursor: onClick ? "pointer" : undefined,
        transform: `translateY(${-liftOffset}px) scale(${isSelfHovered ? 1.12 : 1})`,
        // top도 함께 트랜지션해야 클릭으로 순서(큐)가 바뀔 때 위치가
        // 부드럽게 이동한다. 토스트는 많아야 몇 개라 top 애니메이션의
        // 리플로우 비용은 무시할 수준.
        transition: `transform ${TOAST_ITEM_TRANSITION_MS}ms ease-in-out, top ${TOAST_ITEM_TRANSITION_MS}ms ease-in-out`,
        clipPath: HOVER_CLIP_PATH[ingredient],
        pointerEvents: isDismissing ? "none" : undefined,
        ...style,
      }}>
      <Ingredient ingredient={ingredient} />

      <p
        style={{
          position: "absolute",
          inset: 0,
          // 버튼과 같은 이유로 명시적 z-index를 줘서 Ingredient 위에
          // 확실히 오도록 함.
          zIndex: 5,
          margin: 0,
          padding: `${MESSAGE_PADDING_Y}px ${MESSAGE_PADDING_X}px`,
          overflowWrap: "break-word",
          boxSizing: "border-box",
          // 상속된 색을 그대로 쓰면 소비자 앱의 전역 텍스트 색(회색 계열 등)을
          // 그대로 물려받아 재료 이미지 위에서 잘 안 보일 수 있다 — 라이브러리는
          // 외부 CSS에 기대지 않는다는 원칙대로 명시적으로 지정한다. font-size/
          // font-family는 예외적으로 소비자 서비스의 것을 그대로 상속받게 둔다.
          color: "#1a1a1a",
          // text-align도 명시하지 않으면 소비자 페이지의 전역 정렬(가운데 정렬
          // 등)을 그대로 물려받는다 — 세로만 중앙, 가로는 왼쪽 정렬이 기본이라
          // 둘 다 명시적으로 고정한다.
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          ...messageStyleOverride,
        }}>
        <span
          style={{
            width: "100%",
            // MAX_MESSAGE_LINES를 넘는 메시지는 여기서 말줄임표로 자른다.
            // -webkit-line-clamp는 부모(flex)의 display와 무관하게 이 span
            // 자신의 display를 -webkit-box로 바꿔서 독립적으로 동작한다.
            display: "-webkit-box",
            WebkitLineClamp: MAX_MESSAGE_LINES,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
          {message}
        </span>
      </p>

      {onDismiss && (
        <button
          type="button"
          aria-label="닫기"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          onMouseEnter={() => setIsDismissButtonHovered(true)}
          onMouseLeave={() => setIsDismissButtonHovered(false)}
          style={{
            position: "absolute",
            // Ingredient 내부 이미지들이 겹침 연출을 위해 자체 z-index를
            // 쓰고 있어서, 명시적으로 더 높은 값을 줘야 그 위로 확실히
            // 올라온다 (안 그러면 Ingredient에 가려서 안 보이고 클릭도 안 됨).
            zIndex: 10,
            // 오른쪽 가장자리 세로 50% 지점(중앙). HOVER_CLIP_PATH의 모든
            // 재료가 x=100% 기준 y 20~80% 구간은 안 잘라내므로 50%는
            // 항상 히트테스트 사각지대 밖이다.
            top: "50%",
            right: 4,
            transform: `translateY(-40%) scale(${isDismissButtonHovered ? 1.15 : 1})`,
            width: 22,
            height: 22,
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            borderRadius: "50%",
            // 검정 배경은 재료 이미지와 톤이 맞지 않아 흰 배경 + 어두운 ×로
            // 바꾸고, 밝은 이미지(치즈/빵) 위에서도 경계가 보이도록 그림자를
            // 준다.
            background: isDismissButtonHovered ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.75)",
            color: "#1a1a1a",
            fontSize: 14,
            lineHeight: 1,
            cursor: "pointer",
            transition: "transform 120ms ease-out, background 120ms ease-out, box-shadow 120ms ease-out",
            boxShadow: isDismissButtonHovered ? "0 2px 6px rgba(0, 0, 0, 0.35)" : "0 1px 3px rgba(0, 0, 0, 0.25)",
          }}>
          ×
        </button>
      )}
    </div>
  );
}
