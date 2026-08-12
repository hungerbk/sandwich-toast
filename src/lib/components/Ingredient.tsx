import type { CSSProperties } from "react";
import type { ToastIngredient } from "../store";
import breadSrc from "../assets/bread.webp";
import cheeseSrc from "../assets/cheese.webp";
import ketchupSrc from "../assets/ketchup.webp";
import lettuceSrc from "../assets/lettuce.webp";
import scrambledSrc from "../assets/scrambled.webp";
import tomatoSrc from "../assets/tomato.webp";
import { useInjectedStyle } from "../injectStyle";
import { INGREDIENT_CONTAINER_CLASS, STYLE_KEY, STYLE_CSS } from "./Ingredient.styles";

interface IngredientAsset {
  src: string;
  // 가로로 몇 번 반복해서 겹쳐 배치할지. 지정 안 하면 1장(bread, scrambled).
  repeat?: number;
}

const INGREDIENT_ASSETS: Record<ToastIngredient, IngredientAsset> = {
  lettuce: { src: lettuceSrc, repeat: 4 },
  tomato: { src: tomatoSrc, repeat: 4 },
  cheese: { src: cheeseSrc, repeat: 4 },
  bread: { src: breadSrc },
  scrambled: { src: scrambledSrc },
};

export interface IngredientProps {
  ingredient: ToastIngredient;
  // true면 재료 위에 케찹 애니메이션을 겹쳐 그린다. scrambled 전용이
  // 아니라 어떤 재료든 로딩 중이면 같은 방식으로 얹힌다.
  isLoading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Ingredient({ ingredient, isLoading = false, className, style }: IngredientProps) {
  useInjectedStyle(STYLE_KEY, STYLE_CSS);

  const asset = INGREDIENT_ASSETS[ingredient];
  const repeat = asset.repeat ?? 1;
  const containerClassName = ["sandwich-toast-ingredient", INGREDIENT_CONTAINER_CLASS[ingredient], className].filter(Boolean).join(" ");

  return (
    <div className={containerClassName} style={style}>
      <div className="sandwich-toast-ingredient-tiles">
        {Array.from({ length: repeat }, (_, c) => (
          <img key={`${ingredient}-${c}`} className="sandwich-toast-ingredient-tile" src={asset.src} alt="" />
        ))}
      </div>
      {isLoading && <img className="sandwich-toast-ingredient-ketchup" src={ketchupSrc} alt="" />}
    </div>
  );
}
