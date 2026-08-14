import { addToast, clearToasts, removeToast, type Toast, type ToastIngredient, type ToastType } from "./store";
import { Toaster, type ToasterPosition } from "./components/Toaster";

export type { ToastType, ToastIngredient, ToasterPosition };
export { Toaster };

export interface ToastOptions {
  type?: ToastType;
  ingredient?: ToastIngredient;
  // 로딩과 무관하게 재료 위에 케찹을 정적으로(애니메이션 없이) 얹고
  // 싶을 때. type이 'loading'이면 이 값과 무관하게 항상 애니메이션과
  // 함께 얹힌다.
  ketchup?: boolean;
  // ms. 명시 안 하면 type이 'loading'인지로 정해진다 (로딩 토스트는
  // 시간이 아니라 수동으로 종료되는 게 자연스러우니 기본 무제한).
  duration?: number;
}

const DEFAULT_DURATION_MS = 4000;

// 표준 메서드(success 등)는 이미 type을 스스로 결정했으므로 options로 다시
// type을 주는 건 모순이라 막는다. ingredient는 자유롭게 덮어쓸 수 있다.
type StandardToastOptions = Omit<ToastOptions, "type">;
// 재료 메서드(lettuce 등)는 반대로 ingredient를 막고 type만 열어둔다.
// (예: toast.tomato(msg, { type: 'success' }) — 재료는 tomato 유지, 의미만 success로)
type IngredientToastOptions = Omit<ToastOptions, "ingredient">;

// type↔ingredient 매핑의 단일 소스. 이 한 곳만 바뀌면 표준 타입 메서드와
// 재료 메서드 양쪽에 반영된다. loading↔scrambled도 이 매핑을 그대로 타서,
// toast.loading()과 toast.scrambled()가 다른 타입↔재료 쌍과 동일한 패턴으로
// 서로의 기본값이 된다.
const DEFAULT_INGREDIENT: Record<ToastType, ToastIngredient> = {
  success: "lettuce",
  error: "tomato",
  warning: "cheese",
  info: "bread",
  loading: "scrambled",
};

let toastIdCounter = 0;

function createToast(message: string, defaultType: ToastType, userOptions?: ToastOptions): string {
  const id = `toast-${toastIdCounter++}`;
  const type = userOptions?.type ?? defaultType;
  const finalToast: Toast = {
    id,
    message,
    type,
    // DEFAULT_INGREDIENT는 (혹시 사용자가 덮어쓴) 최종 type이 아니라
    // defaultType(이 메서드 자신의 정체성)으로 찾아야 한다 — 재료 메서드는
    // type을 자유롭게 덮어써도 재료 자체는 그대로 유지돼야 하기 때문
    // (예: toast.tomato(msg, { type: 'success' })는 여전히 tomato). 최종
    // type으로 찾으면 toast.scrambled(msg, { type: 'success' })가 엉뚱하게
    // DEFAULT_INGREDIENT.success인 lettuce로 바뀌는 버그가 생긴다.
    ingredient: userOptions?.ingredient ?? DEFAULT_INGREDIENT[defaultType],
    ketchup: userOptions?.ketchup ?? false,
    // 로딩 토스트는 시간이 아니라 수동으로 끝나는 게 자연스러우니
    // duration을 명시하지 않았다면 무제한으로 둔다. isLoading 같은 별도
    // 필드 없이 type === 'loading' 하나로 판단한다(react-hot-toast,
    // sonner와 동일한 방식) — 지금 이 값을 true로 만드는 진입점은
    // toast.loading()/toast.scrambled() 둘 다 type을 'loading'으로
    // 넘기는 경우뿐이라 굳이 별도 필드를 둘 이유가 없었다.
    duration: userOptions?.duration ?? (type === "loading" ? Infinity : DEFAULT_DURATION_MS),
  };
  addToast(finalToast);
  return id;
}

export const toast = {
  // 표준 타입 지향: 시맨틱 의미(성공/실패/경고/정보)로 호출하는, 다른 토스트
  // 라이브러리와 동일한 익숙한 진입점. 접근성 등 "의미"가 중요한 호출부에 맞는다.
  success: (message: string, options?: StandardToastOptions) => createToast(message, "success", options),
  error: (message: string, options?: StandardToastOptions) => createToast(message, "error", options),
  warning: (message: string, options?: StandardToastOptions) => createToast(message, "warning", options),
  info: (message: string, options?: StandardToastOptions) => createToast(message, "info", options),
  // 로딩 상태를 나타내는 표준 진입점. 재료는 기본적으로 DEFAULT_INGREDIENT를
  // 통해 scrambled로 정해진다(toast.scrambled()와 대칭).
  loading: (message: string, options?: StandardToastOptions) => createToast(message, "loading", options),

  // 재료 지향: 어떤 그림이 뜰지 먼저 정하고 싶을 때 쓰는 진입점. 기본 defaults는
  // 위 표준 메서드와 동일하지만, "의미"보다 "비주얼"이 우선인 호출부에 맞는다.
  lettuce: (message: string, options?: IngredientToastOptions) => createToast(message, "success", options),
  tomato: (message: string, options?: IngredientToastOptions) => createToast(message, "error", options),
  cheese: (message: string, options?: IngredientToastOptions) => createToast(message, "warning", options),
  bread: (message: string, options?: IngredientToastOptions) => createToast(message, "info", options),
  scrambled: (message: string, options?: IngredientToastOptions) => createToast(message, "loading", options),

  // 인자를 아예 안 넘기면(dismiss()) 전체 삭제. id를 넘겼는데 값이 undefined인
  // 경우(예: toast.dismiss(ref.current)에서 ref.current가 아직 없을 때)는
  // 아무 것도 하지 않는다 — "0개 인자"와 "undefined 인자"를 구분해야 실수로
  // 전체가 삭제되는 걸 막을 수 있다.
  dismiss: (...args: [id?: string]) => {
    if (args.length === 0) {
      clearToasts();
      return;
    }
    const [id] = args;
    if (id) removeToast(id);
  },
};
