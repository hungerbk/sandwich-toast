type Edge = 'top' | 'right' | 'bottom' | 'left'

interface BiteSpot {
  edge: Edge
  center: number // 변을 따라가는 위치(%)
  radiusPx: number // 변에 관계없이 둥근 자국을 유지하기 위한 px 반지름
}
// 렌더마다 자국이 흔들리지 않도록 고정된 배치를 사용한다.
const BITE_SPOTS: BiteSpot[] = [
  { edge: 'top', center: 35, radiusPx: 24 },
  { edge: 'right', center: 60, radiusPx: 36 },
  { edge: 'bottom', center: 42, radiusPx: 21 },
  { edge: 'left', center: 70, radiusPx: 26 },
]

const BITE_OFFSETS = [-1, -0.6, -0.2, 0.2, 0.6, 1]

function calcCoord(percent: number, pxDelta: number): string {
  if (pxDelta === 0) return `${percent}%`
  const sign = pxDelta >= 0 ? '+' : '-'
  return `calc(${percent}% ${sign} ${Math.abs(pxDelta).toFixed(1)}px)`
}
function biteNotchPoints(spot: BiteSpot, toPoint: (alongPx: number, depthPx: number) => string): string[] {
  return BITE_OFFSETS.map((o) => {
    const depthPx = spot.radiusPx * Math.sqrt(Math.max(0, 1 - o * o))
    return toPoint(o * spot.radiusPx, depthPx)
  })
}

function edgeBitePoints(spot: BiteSpot, active: boolean): string[] {
  if (!active) return []
  switch (spot.edge) {
    case 'top':
      return biteNotchPoints(spot, (alongPx, d) => `${calcCoord(spot.center, alongPx)} ${d.toFixed(1)}px`)
    case 'right':
      return biteNotchPoints(spot, (alongPx, d) => `${calcCoord(100, -d)} ${calcCoord(spot.center, alongPx)}`)
    // 아래·왼쪽 변은 다각형 순회 방향에 맞춰 좌표 부호를 뒤집는다.
    case 'bottom':
      return biteNotchPoints(spot, (alongPx, d) => `${calcCoord(spot.center, -alongPx)} ${calcCoord(100, -d)}`)
    case 'left':
      return biteNotchPoints(spot, (alongPx, d) => `${d.toFixed(1)}px ${calcCoord(spot.center, -alongPx)}`)
  }
}

const [TOP_SPOT, RIGHT_SPOT, BOTTOM_SPOT, LEFT_SPOT] = BITE_SPOTS

export interface ActiveBites {
  top: boolean
  right: boolean
  bottom: boolean
  left: boolean
}
export function bitePolygon(active: ActiveBites): string {
  const points = [
    '0% 0%',
    ...edgeBitePoints(TOP_SPOT, active.top),
    '100% 0%',
    ...edgeBitePoints(RIGHT_SPOT, active.right),
    '100% 100%',
    ...edgeBitePoints(BOTTOM_SPOT, active.bottom),
    '0% 100%',
    ...edgeBitePoints(LEFT_SPOT, active.left),
  ]
  return `polygon(${points.join(', ')})`
}

export const NO_BITES = bitePolygon({ top: false, right: false, bottom: false, left: false })
export const DISMISS_ANIMATION_MS = 480
