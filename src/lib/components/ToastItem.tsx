import { useState, type CSSProperties, type MouseEventHandler } from 'react'
import type { ToastIngredient } from '../store'
import { useMeasuredRows } from '../useMeasuredRows'
import { Ingredient } from './Ingredient'

export const TOAST_ITEM_WIDTH = 320

// Ingredient 한 행의 대략적인 렌더링 높이(px) 추정치. 카드 너비 기준으로
// 재료별 평균적인 비율에 맞춘 값. 완벽히 정확할 필요는 없다 — rows는
// 어차피 정수로 올림되고, 실제 렌더링 높이는 Ingredient가 스스로 정한다.
const ROW_HEIGHT_PX = 76

export interface ToastItemProps {
  message: string
  ingredient: ToastIngredient
  // 호버 시 위 레이어들이 들리는 연출을 위해 부모(Toaster)가 위로 얼마나
  // 밀어 올릴지 지정한다 (px). 레이아웃 이동은 transform+transition으로만
  // 처리해 리플로우 없이 CSS가 담당한다.
  liftOffset?: number
  onMouseEnter?: MouseEventHandler<HTMLDivElement>
  onMouseLeave?: MouseEventHandler<HTMLDivElement>
  className?: string
  style?: CSSProperties
}

export function ToastItem({
  message,
  ingredient,
  liftOffset = 0,
  onMouseEnter,
  onMouseLeave,
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

  return (
    <div
      className={className}
      onMouseEnter={(e) => {
        setIsSelfHovered(true)
        onMouseEnter?.(e)
      }}
      onMouseLeave={(e) => {
        setIsSelfHovered(false)
        onMouseLeave?.(e)
      }}
      style={{
        position: 'relative',
        width: TOAST_ITEM_WIDTH,
        transform: `translateY(${-liftOffset}px) scale(${isSelfHovered ? 1.06 : 1})`,
        transition: 'transform 200ms ease',
        ...style,
      }}
    >
      <p
        ref={measureRef}
        aria-hidden="true"
        style={{
          visibility: 'hidden',
          position: 'absolute',
          width: '100%',
          margin: 0,
          padding: '16px',
          overflowWrap: 'break-word',
          pointerEvents: 'none',
        }}
      >
        {message}
      </p>

      <Ingredient ingredient={ingredient} rows={rows} />

      <p
        style={{
          position: 'absolute',
          inset: 0,
          margin: 0,
          padding: '16px',
          overflowWrap: 'break-word',
          textAlign: 'center',
        }}
      >
        {message}
      </p>
    </div>
  )
}
