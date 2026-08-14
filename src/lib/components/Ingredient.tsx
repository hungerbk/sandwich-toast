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
  // 로딩 여부와 무관하게 케찹을 정적으로(애니메이션 없이) 얹고 싶을 때.
  // isLoading이 true면 이 값과 무관하게 항상 애니메이션과 함께 얹힌다.
  ketchup?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Ingredient({ ingredient, isLoading = false, ketchup = false, className, style }: IngredientProps) {
  useInjectedStyle(STYLE_KEY, STYLE_CSS);

  const asset = INGREDIENT_ASSETS[ingredient];
  const repeat = asset.repeat ?? 1;
  const containerClassName = ["sandwich-toast-ingredient", INGREDIENT_CONTAINER_CLASS[ingredient], className].filter(Boolean).join(" ");
  const showKetchup = isLoading || ketchup;
  const ketchupClassName = ["sandwich-toast-ingredient-ketchup", isLoading && "sandwich-toast-ingredient-ketchup--animated"].filter(Boolean).join(" ");

  return (
    <div className={containerClassName} style={style}>
      <div className="sandwich-toast-ingredient-tiles">
        {Array.from({ length: repeat }, (_, c) => (
          <img key={`${ingredient}-${c}`} className="sandwich-toast-ingredient-tile" src={asset.src} alt="" />
        ))}
      </div>
      {showKetchup && <img className={ketchupClassName} src={ketchupSrc} alt="" />}
    </div>
  );
}
