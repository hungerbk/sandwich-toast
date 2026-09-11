import type { ToastIngredient } from "../types";
import { scaled } from "../scale";
export const TOAST_ITEM_WIDTH = 320;
export const TOAST_ITEM_TRANSITION_MS = 320;
const MAX_MESSAGE_LINES = 2;
const MESSAGE_PADDING_Y = 18;
const MESSAGE_PADDING_X = 28;
export const LIFT_VAR = "--sandwich-toast-lift";
export const INGREDIENT_CLIP_CLASS: Partial<Record<ToastIngredient, string>> = {
  lettuce: "sandwich-toast-item--lettuce",
  tomato: "sandwich-toast-item--tomato",
  cheese: "sandwich-toast-item--cheese",
};
export const INGREDIENT_MESSAGE_CLASS: Partial<Record<ToastIngredient, string>> = {
  lettuce: "sandwich-toast-message--lettuce",
  bread: "sandwich-toast-message--bread",
  cheese: "sandwich-toast-message--cheese",
};
export const STYLE_KEY = "toast-item";
export const STYLE_CSS = `
.sandwich-toast-item {

  position: absolute;
  left: 0;
  width: ${scaled(TOAST_ITEM_WIDTH)};

  transform: translateY(var(${LIFT_VAR}, 0px)) scale(1);

  transition: transform ${TOAST_ITEM_TRANSITION_MS}ms ease-in-out, top ${TOAST_ITEM_TRANSITION_MS}ms ease-in-out, bottom ${TOAST_ITEM_TRANSITION_MS}ms ease-in-out;
}
.sandwich-toast-item:hover {
  transform: translateY(var(${LIFT_VAR}, 0px)) scale(1.12);
}
.sandwich-toast-item--clickable {
  cursor: pointer;
}
.sandwich-toast-item--dismissing {
  pointer-events: none;
}
.sandwich-toast-item--lettuce {
  clip-path: polygon(15% 0%, 100% 0%, 100% 58%, 58% 100%, 0% 100%);
}
.sandwich-toast-item--tomato {
  clip-path: polygon(19% 0%, 81% 0%, 100% 20%, 100% 81%, 81% 100%, 18% 100%, 0% 81%, 0% 19%);
}
.sandwich-toast-item--cheese {
  clip-path: polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%);
}

.sandwich-toast-message {
  position: absolute;
  inset: 0;

  z-index: 5;
  margin: 0;
  padding: ${scaled(MESSAGE_PADDING_Y)} ${scaled(MESSAGE_PADDING_X)};
  overflow-wrap: break-word;
  box-sizing: border-box;

  color: #1a1a1a;
  text-align: left;
  display: flex;
  align-items: center;
}
.sandwich-toast-message--lettuce {
  padding-left: ${scaled(40)};
}
.sandwich-toast-message--bread {
  padding-left: ${scaled(40)};
  transform: translateY(${scaled(-4)});
}
.sandwich-toast-message--cheese {
  transform: translateY(${scaled(-8)});
}

.sandwich-toast-message-text {

  width: fit-content;
  max-width: 100%;

  background: rgba(255, 255, 255, 0.45);
  border-radius: ${scaled(8)};
  padding: ${scaled(4)} ${scaled(10)};
  box-sizing: border-box;

  display: -webkit-box;
  -webkit-line-clamp: ${MAX_MESSAGE_LINES};
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sandwich-toast-dismiss-button {
  position: absolute;
  z-index: 10;

  top: 40%;
  right: ${scaled(4)};
  transform: translateY(-40%) scale(1);
  width: ${scaled(22)};
  height: ${scaled(22)};
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;

  background: rgba(255, 255, 255, 0.75);
  color: #1a1a1a;
  font-size: ${scaled(14)};
  line-height: 1;
  cursor: pointer;
  transition: transform 120ms ease-out, background 120ms ease-out, box-shadow 120ms ease-out;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}
.sandwich-toast-dismiss-button:hover {
  transform: translateY(-40%) scale(1.15);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
}
`;
