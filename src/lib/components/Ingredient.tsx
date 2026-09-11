import type { CSSProperties } from "react";
import type { ToastIngredient } from "../types";
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
  isLoading?: boolean;
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
