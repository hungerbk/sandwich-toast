// Toaster에서 지정한 배율을 자식 스타일에 상속한다.
export const SCALE_VAR = "--sandwich-toast-scale";
export function scaled(px: number): string {
  return `calc(var(${SCALE_VAR}, 1) * ${px}px)`
}
