import { addToast, clearToasts, removeToast } from "./store";
import type { Toast, ToastIngredient, ToastType, ToastOptions, StandardToastOptions, IngredientToastOptions } from "./types";

const DEFAULT_DURATION_MS = 4000;
const MAX_TIMEOUT_MS = 2 ** 31 - 1;
const DEFAULT_INGREDIENT: Record<ToastType, ToastIngredient> = {
  success: "lettuce",
  error: "tomato",
  warning: "cheese",
  info: "bread",
  loading: "scrambled",
};

function resolveDuration(duration: number | undefined, type: ToastType): number {
  if (duration === Infinity) return duration;
  if (duration !== undefined && Number.isFinite(duration) && duration >= 0 && duration <= MAX_TIMEOUT_MS) {
    return duration;
  }
  return type === "loading" ? Infinity : DEFAULT_DURATION_MS;
}

let toastIdCounter = 0;

function createToast(message: string, defaultType: ToastType, userOptions?: ToastOptions): string {
  const id = `toast-${toastIdCounter++}`;
  const type = userOptions?.type ?? defaultType;
  const finalToast: Toast = {
    id,
    message,
    type,
    // 재료 메서드는 type을 덮어써도 자신의 기본 재료를 유지한다.
    ingredient: userOptions?.ingredient ?? DEFAULT_INGREDIENT[defaultType],
    ketchup: userOptions?.ketchup ?? false,
    duration: resolveDuration(userOptions?.duration, type),
  };
  addToast(finalToast);
  return id;
}

export const toast = {
  success: (message: string, options?: StandardToastOptions) => createToast(message, "success", options),
  error: (message: string, options?: StandardToastOptions) => createToast(message, "error", options),
  warning: (message: string, options?: StandardToastOptions) => createToast(message, "warning", options),
  info: (message: string, options?: StandardToastOptions) => createToast(message, "info", options),
  loading: (message: string, options?: StandardToastOptions) => createToast(message, "loading", options),
  lettuce: (message: string, options?: IngredientToastOptions) => createToast(message, "success", options),
  tomato: (message: string, options?: IngredientToastOptions) => createToast(message, "error", options),
  cheese: (message: string, options?: IngredientToastOptions) => createToast(message, "warning", options),
  bread: (message: string, options?: IngredientToastOptions) => createToast(message, "info", options),
  scrambled: (message: string, options?: IngredientToastOptions) => createToast(message, "loading", options),
  // 인자 생략은 전체 삭제, 명시적인 undefined는 아무것도 삭제하지 않는다.
  dismiss: (...args: [id?: string]) => {
    if (args.length === 0) {
      clearToasts();
      return;
    }
    const [id] = args;
    if (id) removeToast(id);
  },
};
