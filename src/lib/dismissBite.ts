type Edge = 'top' | 'right' | 'bottom' | 'left'

interface BiteSpot {
  edge: Edge
  center: number // 그 변 기준 위치 (%). 변을 따라가는 좌표라 %가 자연스럽다.
  radiusPx: number // 물린 자리 반지름(px). 카드가 가로로 훨씬 넓어서 %를
  // 쓰면 좌우변의 깊이(가로 축)와 상하변의 깊이(세로 축)가 같은 숫자여도
  // 실제 px 크기가 크게 달라져 좌우 자국이 길쭉하게 늘어난다. px로
  // 통일해야 어느 변이든 실제로 똑같이 둥글게 보인다.
}

// 상/우/하/좌 각 변에 하나씩, 위치·크기를 일부러 불규칙하게 흩어놓은
// 고정값 (렌더마다 바뀌는 진짜 랜덤이 아니라 "랜덤해 보이는" 고정 배치 —
// 매번 값이 바뀌면 흔들려 보인다). 대칭·회전대칭으로 안 보이도록 4개
// center를 규칙 없이 잡았다.
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

// 점 3개(뾰족한 삼각형)가 아니라 6개를 반원 근사로 배치해서 둥그스름한
// 바이트 자국처럼 보이게 한다. 반지름은 항상 고정값 — "자라나는" 게
// 아니라 있다/없다만 바뀌는 팝(pop) 방식이라 따로 애니메이션하지 않는다.
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
    case 'bottom':
      // 아래쪽 변은 순회 방향이 오른쪽 -> 왼쪽(along 감소)이라 부호를 뒤집는다.
      return biteNotchPoints(spot, (alongPx, d) => `${calcCoord(spot.center, -alongPx)} ${calcCoord(100, -d)}`)
    case 'left':
      // 왼쪽 변은 순회 방향이 아래 -> 위(along 감소)라 마찬가지로 뒤집는다.
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

// 네 자리를 각각 있음/없음으로 켜고 끌 수 있는 clip-path를 만든다. 삭제
// 애니메이션에서 하나씩 순서대로 켜서, 동시에가 아니라 시간차를 두고
// 한 입씩 베어 무는 느낌을 낸다.
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
