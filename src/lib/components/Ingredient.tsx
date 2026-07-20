import type { CSSProperties } from "react";
import type { ToastIngredient } from "../store";
import breadSrc from "../assets/bread.webp";
import cheeseSrc from "../assets/cheese.webp";
import lettuceSrc from "../assets/lettuce.webp";
import tomatoSrc from "../assets/tomato.webp";

// 모든 재료의 렌더링 높이를 이 값 하나로 고정한다. 재료마다 원본 이미지
// 구도가 달라 자연 높이가 제각각이라(80~145px), 통일하지 않으면 재료별로
// 카드 비율이 들쭉날쭉해 보인다.
const TARGET_ROW_HEIGHT = 110;

interface IngredientAsset {
  src: string;
  // 개별 이미지(타일 하나)에 적용.
  style?: CSSProperties;
  // 가로로 몇 번 반복해서 겹쳐 배치할지. 지정 안 하면 1장(bread).
  repeat?: number;
  // 재료마다 원본 이미지 구도 때문에 자연스러운 렌더링 높이가 크게
  // 다르다(80~145px) — 겹쳐진 타일 전체를 감싸는 컨테이너에 적용한다.
  // 개별 이미지에 object-fit을 주는 것과 달리 타일들의 겹침 비율은 그대로
  // 유지된 채 바깥 뷰포트만 잘리는 방식이라, lettuce처럼 여러 장이 겹쳐
  // 타일링되는 재료에 적합하다(개별 이미지를 줄이면 겹침이 깨져서 사이가
  // 벌어져 보인다).
  rowStyle?: CSSProperties;
}

const INGREDIENT_ASSETS: Record<ToastIngredient, IngredientAsset> = {
  lettuce: { src: lettuceSrc, repeat: 4, rowStyle: { height: TARGET_ROW_HEIGHT, overflow: "hidden" } },
  tomato: { src: tomatoSrc, repeat: 4, rowStyle: { height: TARGET_ROW_HEIGHT, overflow: "hidden" } },
  cheese: { src: cheeseSrc, repeat: 4, rowStyle: { height: TARGET_ROW_HEIGHT, overflow: "hidden" } },
  bread: { src: breadSrc, style: { height: TARGET_ROW_HEIGHT, objectFit: "contain" } },
};

// 반복 타일마다 손그림 느낌으로 살짝 다른 각도를 준다. 렌더링마다 값이
// 바뀌면(Math.random) 리렌더될 때 그림이 흔들려 보이므로 고정값을 쓴다.
const TILE_ROTATIONS = [-4, 3, -2, 4];

// 회전하면 모서리가 박스 밖으로 나와서 시각적으로 커 보이므로, 잘리지
// 않는 선에서 그만큼만 축소해 보정한다. 정사각형에 가까운 이미지이
// TILE_ROTATIONS 중 가장 큰 각도(4도)로 회전했을 때 필요한 최소 축소량
// 기준(cos4°+sin4°≈1.067 → 1/1.067≈0.937)에 약간의 여유만 더한 값.
const ROTATION_COMPENSATE_SCALE = 0.95;

// 반복되는 타일끼리 겹치는 비율 (가로, 음수 margin)
const REPEAT_OVERLAP = "24%";

export interface IngredientProps {
  ingredient: ToastIngredient;
  className?: string;
  style?: CSSProperties;
}

export function Ingredient({ ingredient, className, style }: IngredientProps) {
  const asset = INGREDIENT_ASSETS[ingredient];
  const repeat = asset.repeat ?? 1;

  return (
    <div
      className={className}
      style={{
        display: "flex",
        width: "100%",
        ...asset.rowStyle,
        ...style,
      }}>
      {Array.from({ length: repeat }, (_, c) => (
        <img
          key={`${ingredient}-${c}`}
          src={asset.src}
          alt=""
          style={{
            display: "block",
            flex: 1,
            minWidth: 0,
            height: "auto",
            marginLeft: c === 0 ? 0 : `-${REPEAT_OVERLAP}`,
            zIndex: c,
            transform: repeat > 1 ? `rotate(${TILE_ROTATIONS[c % TILE_ROTATIONS.length]}deg) scale(${ROTATION_COMPENSATE_SCALE})` : undefined,
            ...asset.style,
          }}
        />
      ))}
    </div>
  );
}
