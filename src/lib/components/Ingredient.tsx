import type { CSSProperties } from "react";
import type { ToastIngredient } from "../store";
import breadSrc from "../assets/bread.webp";
import cheeseSrc from "../assets/cheese.webp";
import lettuceSrc from "../assets/lettuce.webp";
import tomatoSrc from "../assets/tomato.webp";

interface IngredientAsset {
  src: string;
  style?: CSSProperties;
  // 지정하면 이미지를 이 개수만큼 겹쳐서 반복 배치해 빵 가로 길이를 채운다
  // (lettuce/tomato/cheese). 없으면 통이미지 1장으로 렌더링한다 (bread).
  repeat?: number;
}

const INGREDIENT_ASSETS: Record<ToastIngredient, IngredientAsset> = {
  lettuce: { src: lettuceSrc, repeat: 4 },
  tomato: { src: tomatoSrc, repeat: 4 },
  cheese: { src: cheeseSrc, repeat: 4 },
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

// 타일끼리 이 비율만큼 겹친다 (음수 margin).
const TILE_OVERLAP = "24%";

export interface IngredientProps {
  ingredient: ToastIngredient;
  className?: string;
  style?: CSSProperties;
}

export function Ingredient({ ingredient, className, style }: IngredientProps) {
  const asset = INGREDIENT_ASSETS[ingredient];

  if (!asset.repeat) {
    return (
      <img
        src={asset.src}
        alt=""
        className={className}
        style={{ display: "block", width: "100%", ...style, ...asset.style }}
      />
    );
  }

  return (
    <div className={className} style={{ display: "flex", width: "100%", ...style }}>
      {Array.from({ length: asset.repeat }, (_, i) => (
        <img
          key={`${ingredient}-${i}`}
          src={asset.src}
          alt=""
          style={{
            display: "block",
            flex: 1,
            minWidth: 0,
            height: "auto",
            marginLeft: i === 0 ? 0 : `-${TILE_OVERLAP}`,
            zIndex: i,
            transform: `rotate(${TILE_ROTATIONS[i % TILE_ROTATIONS.length]}deg) scale(${ROTATION_COMPENSATE_SCALE})`,
            ...asset.style,
          }}
        />
      ))}
    </div>
  );
}
