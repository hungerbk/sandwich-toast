export const SCALE_VAR = "--sandwich-toast-scale";
export function scaled(px: number): string {
  return `calc(var(${SCALE_VAR}, 1) * ${px}px)`
}
