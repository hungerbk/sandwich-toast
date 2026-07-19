import { useRef, useState, type CSSProperties, type MouseEventHandler } from 'react'
import type { ToastIngredient } from '../store'
import { useMeasuredRows } from '../useMeasuredRows'
import { bitePolygon, NO_BITES, DISMISS_ANIMATION_MS } from '../dismissBite'
import { Ingredient } from './Ingredient'

export const TOAST_ITEM_WIDTH = 320

// 위치(top)/리프트(transform) 이동에 쓰는 트랜지션 시간. 부모가 호버/클릭
// 애니메이션이 끝나는 시점을 알아야 할 때(예: 재정렬 중 호버 억제) 이
// 값을 기준으로 계산하도록 export한다.
export const TOAST_ITEM_TRANSITION_MS = 320

// Ingredient 한 행의 대략적인 렌더링 높이(px) 추정치. 카드 너비 기준으로
// 재료별 평균적인 비율에 맞춘 값. 완벽히 정확할 필요는 없다 — rows는
// 어차피 정수로 올림되고, 실제 렌더링 높이는 Ingredient가 스스로 정한다.
const ROW_HEIGHT_PX = 76

// 재료 그림이 사각형 박스를 꽉 채우지 않으면, 빈 모서리가 마우스 이벤트를
// 가로채서 뒤에 쌓인 다른 토스트를 호버하기 어렵게 만든다. 그 모서리만큼
// 카드 자체를 clip-path로 잘라내 이벤트가 통과하도록 한다. 이미지 실루엣에
// 정확히 맞출 필요는 없고, 문제가 되는 영역만 대략 잘라낸다.
const HOVER_CLIP_PATH: Partial<Record<ToastIngredient, string>> = {
  // 상추는 좌하-우상 대각선으로 그려져 있어 우하단 모서리가 비어있다.
  lettuce: 'polygon(15% 0%, 100% 0%, 100% 58%, 58% 100%, 0% 100%)',
  // 토마토는 원형에 가까워 네 모서리가 다 비어있다.
  tomato: 'polygon(19% 0%, 81% 0%, 100% 20%, 100% 81%, 81% 100%, 18% 100%, 0% 81%, 0% 19%)',
  // 치즈는 사각형에 가깝지만 모서리가 둥글게 깎여있어 살짝만 잘라낸다.
  cheese: 'polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)',
  // bread는 캔버스를 거의 꽉 채워서 clip이 필요 없다.
}

export interface ToastItemProps {
  message: string
  ingredient: ToastIngredient
  // 호버 시 위 레이어들이 들리는 연출을 위해 부모(Toaster)가 위로 얼마나
  // 밀어 올릴지 지정한다 (px). 레이아웃 이동은 transform+transition으로만
  // 처리해 리플로우 없이 CSS가 담당한다.
  liftOffset?: number
  onMouseEnter?: MouseEventHandler<HTMLDivElement>
  onMouseLeave?: MouseEventHandler<HTMLDivElement>
  // 클릭해서 스택 맨 앞으로 가져오는 동작. z-index/liftOffset 계산은
  // 형제 토스트를 알아야 해서 부모(Toaster)가 담당하고, ToastItem은
  // 클릭 이벤트만 그대로 전달한다.
  onClick?: MouseEventHandler<HTMLDivElement>
  // 지정하면 우상단에 삭제(X) 버튼이 뜨고, 베어 물린 듯한 애니메이션이
  // 끝난 뒤 호출된다. 실제로 store에서 지우는 건 호출하는 쪽(Toaster) 책임.
  onDismiss?: () => void
  className?: string
  style?: CSSProperties
}

export function ToastItem({
  message,
  ingredient,
  liftOffset = 0,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onDismiss,
  className,
  style,
}: ToastItemProps) {
  // 화면에 실제로 보이는 텍스트는 Ingredient 위에 absolute로 겹쳐지는데,
  // 그 상태로 높이를 재면 Ingredient의 rows -> 높이 -> 다시 텍스트 높이로
  // 순환 참조가 생긴다. 그래서 레이아웃에 영향 없는 숨김 복제본으로
  // "제약 없는 원래 높이"를 따로 측정한다.
  const { ref: measureRef, rows } = useMeasuredRows<HTMLParagraphElement>(ROW_HEIGHT_PX)

  // 형제 토스트를 위해 비켜서는 것(liftOffset)과 달리, "내가 호버됐을 때
  // 커지는" 건 다른 토스트를 몰라도 되는 자기 완결적 동작이라 내부에서
  // 처리한다.
  const [isSelfHovered, setIsSelfHovered] = useState(false)
  const [isDismissing, setIsDismissing] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const handleDismiss = () => {
    if (isDismissing) return
    setIsDismissing(true)

    const el = rootRef.current
    // jsdom(Jest/Vitest 테스트 환경)이나 구형 브라우저엔 Web Animations
    // API가 없을 수 있다 — 그런 경우 애니메이션 없이 바로 dismiss.
    if (!el || typeof el.animate !== 'function') {
      onDismiss?.()
      return
    }
    const F = false
    const T = true
    const animation = el.animate(
      [
        { clipPath: NO_BITES, opacity: 1, offset: 0 },
        { clipPath: bitePolygon({ top: F, right: T, bottom: F, left: F }), opacity: 1, offset: 0.22 },
        { clipPath: bitePolygon({ top: T, right: T, bottom: F, left: F }), opacity: 1, offset: 0.44 },
        { clipPath: bitePolygon({ top: T, right: T, bottom: T, left: F }), opacity: 1, offset: 0.66 },
        { clipPath: bitePolygon({ top: T, right: T, bottom: T, left: T }), opacity: 1, offset: 0.82 },
        { clipPath: bitePolygon({ top: T, right: T, bottom: T, left: T }), opacity: 0, offset: 1 },
      ],
      { duration: DISMISS_ANIMATION_MS, easing: 'ease-out' },
    )
    animation.onfinish = () => onDismiss?.()
  }

  return (
    <div
      ref={rootRef}
      className={className}
      onMouseEnter={(e) => {
        setIsSelfHovered(true)
        onMouseEnter?.(e)
      }}
      onMouseLeave={(e) => {
        setIsSelfHovered(false)
        onMouseLeave?.(e)
      }}
      onClick={onClick}
      style={{
        position: 'relative',
        width: TOAST_ITEM_WIDTH,
        cursor: onClick ? 'pointer' : undefined,
        transform: `translateY(${-liftOffset}px) scale(${isSelfHovered ? 1.12 : 1})`,
        // top도 함께 트랜지션해야 클릭으로 순서(큐)가 바뀔 때 위치가
        // 부드럽게 이동한다. 토스트는 많아야 몇 개라 top 애니메이션의
        // 리플로우 비용은 무시할 수준.
        transition: `transform ${TOAST_ITEM_TRANSITION_MS}ms ease-in-out, top ${TOAST_ITEM_TRANSITION_MS}ms ease-in-out`,
        clipPath: HOVER_CLIP_PATH[ingredient],
        pointerEvents: isDismissing ? 'none' : undefined,
        ...style,
      }}
    >
      <p
        ref={measureRef}
        aria-hidden="true"
        style={{
          visibility: 'hidden',
          position: 'absolute',
          // width:100%은 box-sizing이 content-box(브라우저 기본값)일 때
          // padding만큼 실제 렌더링 폭이 부모보다 커진다. inset으로 좌우를
          // 직접 고정하면 box-sizing과 무관하게 padding이 안쪽으로 들어간다.
          inset: '0 0 auto 0',
          margin: 0,
          padding: '16px',
          overflowWrap: 'break-word',
          pointerEvents: 'none',
          boxSizing: 'border-box',
        }}
      >
        {message}
      </p>

      <Ingredient ingredient={ingredient} rows={rows} />

      <p
        style={{
          position: 'absolute',
          inset: 0,
          // 버튼과 같은 이유로 명시적 z-index를 줘서 Ingredient 위에
          // 확실히 오도록 함.
          zIndex: 5,
          margin: 0,
          padding: '16px',
          overflowWrap: 'break-word',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      >
        {message}
      </p>

      {onDismiss && (
        <button
          type="button"
          aria-label="닫기"
          onClick={(e) => {
            e.stopPropagation()
            handleDismiss()
          }}
          style={{
            position: 'absolute',
            // Ingredient 내부 이미지들이 겹침 연출을 위해 자체 z-index를
            // 쓰고 있어서, 명시적으로 더 높은 값을 줘야 그 위로 확실히
            // 올라온다 (안 그러면 Ingredient에 가려서 안 보이고 클릭도 안 됨).
            zIndex: 10,
            // 진짜 우상단 모서리(top:0 근처)는 HOVER_CLIP_PATH가 토마토/
            // 치즈에서 잘라내는 영역이라 버튼이 히트테스트 사각지대에
            // 들어간다. 세로 20% 지점부터는 모든 재료의 clip이 그 자리를
            // 온전히 남겨두므로, 관례적인 우상단 위치는 유지하되 그만큼만
            // 아래로 내린다.
            top: '20%',
            right: 4,
            width: 22,
            height: 22,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.5)',
            color: '#fff',
            fontSize: 14,
            lineHeight: 1,
            cursor: 'pointer',
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}
