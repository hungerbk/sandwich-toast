import { useInsertionEffect } from "react";
const injectedKeys = new Set<string>();

export function useInjectedStyle(key: string, css: string, nonce?: string) {
  useInsertionEffect(() => {
    if (injectedKeys.has(key)) return;
    if (typeof document === "undefined") return;

    const style = document.createElement("style");
    style.setAttribute("data-sandwich-toast", key);
    if (nonce) style.nonce = nonce;
    style.textContent = css;
    document.head.appendChild(style);
    injectedKeys.add(key);
  }, [key, css, nonce]);
}
