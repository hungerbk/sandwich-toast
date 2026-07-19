import { useState, type CSSProperties, type MouseEventHandler } from "react";
import type { ToastIngredient } from "../store";
import { useMeasuredRows } from "../useMeasuredRows";
import { Ingredient } from "./Ingredient";

export const TOAST_ITEM_WIDTH = 320;

// 위치(top)/리프트(transform) 이동에 쓰는 트랜지션 시간. 부모가 호버/클릭
// 애니메이션이 끝나는 시점을 알아야 할 때(예: 재정렬 중 호버 억제) 이
// 값을 기준으로 계산하도록 export한다.
export const TOAST_ITEM_TRANSITION_MS = 320;

// Ingredient 한 행의 대략적인 렌더링 높이(px) 추정치. 카드 너비 기준으로
// 재료별 평균적인 비율에 맞춘 값. 완벽히 정확할 필요는 없다 — rows는
// 어차피 정수로 올림되고, 실제 렌더링 높이는 Ingredient가 스스로 정한다.
const ROW_HEIGHT_PX = 76;

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
  className?: string;
  style?: CSSProperties;
}

export function ToastItem({ message, ingredient, liftOffset = 0, onMouseEnter, onMouseLeave, onClick, className, style }: ToastItemProps) {
  // 화면에 실제로 보이는 텍스트는 Ingredient 위에 absolute로 겹쳐지는데,
  // 그 상태로 높이를 재면 Ingredient의 rows -> 높이 -> 다시 텍스트 높이로
  // 순환 참조가 생긴다. 그래서 레이아웃에 영향 없는 숨김 복제본으로
  // "제약 없는 원래 높이"를 따로 측정한다.
  const { ref: measureRef, rows } = useMeasuredRows<HTMLParagraphElement>(ROW_HEIGHT_PX);

  // 형제 토스트를 위해 비켜서는 것(liftOffset)과 달리, "내가 호버됐을 때
  // 커지는" 건 다른 토스트를 몰라도 되는 자기 완결적 동작이라 내부에서
  // 처리한다.
  const [isSelfHovered, setIsSelfHovered] = useState(false);

  return (
    <div
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
        ...style,
      }}>
      <p
        ref={measureRef}
        aria-hidden="true"
        style={{
          visibility: "hidden",
          position: "absolute",
          // width:100%은 box-sizing이 content-box(브라우저 기본값)일 때
          // padding만큼 실제 렌더링 폭이 부모보다 커진다. inset으로 좌우를
          // 직접 고정하면 box-sizing과 무관하게 padding이 안쪽으로 들어간다.
          inset: "0 0 auto 0",
          margin: 0,
          padding: "16px",
          overflowWrap: "break-word",
          pointerEvents: "none",
          boxSizing: "border-box",
        }}>
        {message}
      </p>

      <Ingredient ingredient={ingredient} rows={rows} />

      <p
        style={{
          position: "absolute",
          inset: 0,
          margin: 0,
          padding: "16px",
          overflowWrap: "break-word",
          textAlign: "center",
          boxSizing: "border-box",
        }}>
        {message}
      </p>
    </div>
  );
}
