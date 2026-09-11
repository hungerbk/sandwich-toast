import type { ToastIngredient } from "../types";
import { scaled } from "../scale";
const TARGET_ROW_HEIGHT = 110;
export const INGREDIENT_CONTAINER_CLASS: Record<ToastIngredient, string> = {
  lettuce: "sandwich-toast-ingredient--lettuce",
  tomato: "sandwich-toast-ingredient--tomato",
  cheese: "sandwich-toast-ingredient--cheese",
  bread: "sandwich-toast-ingredient--bread",
  scrambled: "sandwich-toast-ingredient--scrambled",
};

export const STYLE_KEY = "ingredient";
export const STYLE_CSS = `
.sandwich-toast-ingredient {
  width: 100%;

  position: relative;
}

.sandwich-toast-ingredient-tiles {
  display: flex;
  width: 100%;
}

.sandwich-toast-ingredient--lettuce .sandwich-toast-ingredient-tiles,
.sandwich-toast-ingredient--tomato .sandwich-toast-ingredient-tiles,
.sandwich-toast-ingredient--cheese .sandwich-toast-ingredient-tiles {
  height: ${scaled(TARGET_ROW_HEIGHT)};
  overflow: hidden;
}

.sandwich-toast-ingredient-tile {
  display: block;
  flex: 1;
  min-width: 0;
  height: auto;
}

.sandwich-toast-ingredient--bread .sandwich-toast-ingredient-tile,
.sandwich-toast-ingredient--scrambled .sandwich-toast-ingredient-tile {
  height: ${scaled(TARGET_ROW_HEIGHT)};
  object-fit: contain;
}

.sandwich-toast-ingredient-ketchup {
  position: absolute;
  inset: 0;
  width: 100%;
  height: ${scaled(TARGET_ROW_HEIGHT)};
  object-fit: contain;
  z-index: 4;
  pointer-events: none;
  clip-path: inset(0 0% 0 0);
}
.sandwich-toast-ingredient-ketchup--animated {
  animation: sandwich-toast-ketchup-squeeze 2.4s ease-in-out infinite;
}

@keyframes sandwich-toast-ketchup-squeeze {
  0% {
    clip-path: inset(0 100% 0 0);
  }
  50% {
    clip-path: inset(0 0% 0 0);
  }
  80% {
    clip-path: inset(0 0% 0 0);
  }
  100% {
    clip-path: inset(0 100% 0 0);
  }
}

.sandwich-toast-ingredient-tile:not(:first-child) {
  margin-left: -24%;
}

.sandwich-toast-ingredient-tile:nth-child(1):not(:only-child) {
  z-index: 0;
  transform: rotate(-4deg) scale(0.95);
}
.sandwich-toast-ingredient-tile:nth-child(2) {
  z-index: 1;
  transform: rotate(3deg) scale(0.95);
}
.sandwich-toast-ingredient-tile:nth-child(3) {
  z-index: 2;
  transform: rotate(-2deg) scale(0.95);
}
.sandwich-toast-ingredient-tile:nth-child(4) {
  z-index: 3;
  transform: rotate(4deg) scale(0.95);
}
`;
