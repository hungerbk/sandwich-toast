import type { CSSProperties } from "react";
import type { ToastIngredient } from "../store";
import breadSrc from "../assets/bread.webp";
import cheeseSrc from "../assets/cheese.webp";
import lettuceSrc from "../assets/lettuce.webp";
import tomatoSrc from "../assets/tomato.webp";

interface IngredientAsset {
  src: string;
  style?: CSSProperties;
  // 가로로 몇 개 겹쳐서 나란히 배치할지. 지정 안 하면 1장(bread).
  columns?: number;
}

const INGREDIENT_ASSETS: Record<ToastIngredient, IngredientAsset> = {
  lettuce: { src: lettuceSrc, columns: 4 },
  tomato: { src: tomatoSrc, columns: 4 },
  cheese: { src: cheeseSrc, columns: 4 },
  bread: { src: breadSrc },
};

// 반복 타일마다 손그림 느낌으로 살짝 다른 각도를 준다. 렌더링마다 값이
// 바뀌면(Math.random) 리렌더될 때 그림이 흔들려 보이므로 고정값을 쓴다.
const TILE_ROTATIONS = [-4, 3, -2, 4];

// 회전하면 모서리가 박스 밖으로 나와서 시각적으로 커 보이므로, 잘리지
// 않는 선에서 그만큼만 축소해 보정한다. 정사각형에 가까운 이미지가
// TILE_ROTATIONS 중 가장 큰 각도(4도)로 회전했을 때 필요한 최소 축소량
// 기준(cos4°+sin4°≈1.067 → 1/1.067≈0.937)에 약간의 여유만 더한 값.
const ROTATION_COMPENSATE_SCALE = 0.95;

// 같은 행 안에서 타일끼리 겹치는 비율 (가로, 음수 margin)
const COLUMN_OVERLAP = "24%";
// 행끼리 겹치는 비율 (세로, 음수 margin)
const ROW_OVERLAP = "25%";

export interface IngredientProps {
  ingredient: ToastIngredient;
  // 메시지가 길어져 토스트가 세로로 늘어날 때, 같은 타일 배열을 이 값만큼
  // 세로로 반복해 쌓아 높이를 채운다. 이미지 자체를 늘리지(stretch) 않고
  // 층을 하나 더 얹는 방식이라 그림이 찌그러지지 않는다.
  rows?: number;
  className?: string;
  style?: CSSProperties;
}

export function Ingredient({ ingredient, rows = 1, className, style }: IngredientProps) {
  const asset = INGREDIENT_ASSETS[ingredient];
  const columns = asset.columns ?? 1;
  const rowCount = Math.max(1, rows);

  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", width: "100%", ...style }}>
      {Array.from({ length: rowCount }, (_, r) => (
        <div
          key={r}
          style={{
            display: "flex",
            width: "100%",
            marginTop: r === 0 ? 0 : `-${ROW_OVERLAP}`,
            // flex item에 z-index를 주면 그 자체로 새 stacking context가
            // 생겨서, 안에 있는 이미지들의 zIndex(0~3)가 다른 행과 섞이지
            // 않고 이 행 안에서만 비교된다. 값 자체는 앞쪽 행(r이 작을수록)이
            // 위로 오도록 내림차순.
            zIndex: rowCount - r,
          }}>
          {Array.from({ length: columns }, (_, c) => (
            <img
              key={`${ingredient}-${r}-${c}`}
              src={asset.src}
              alt=""
              style={{
                display: "block",
                flex: 1,
                minWidth: 0,
                height: "auto",
                marginLeft: c === 0 ? 0 : `-${COLUMN_OVERLAP}`,
                zIndex: c,
                transform: columns > 1 ? `rotate(${TILE_ROTATIONS[c % TILE_ROTATIONS.length]}deg) scale(${ROTATION_COMPENSATE_SCALE})` : undefined,
                ...asset.style,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
