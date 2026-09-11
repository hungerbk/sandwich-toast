import { useInsertionEffect } from "react";
// key별 CSS는 고정이며, 같은 모듈에서 한 번만 주입한다.
const injectedKeys = new Set<string>();

export function useInjectedStyle(key: string, css: string) {
  useInsertionEffect(() => {
    if (injectedKeys.has(key)) return;
    if (typeof document === "undefined") return;

    const style = document.createElement("style");
    style.setAttribute("data-sandwich-toast", key);
    style.textContent = css;
    document.head.appendChild(style);
    injectedKeys.add(key);
  }, [key, css]);
}
