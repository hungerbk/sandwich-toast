import { useInsertionEffect } from "react";

// key가 같으면 여러 컴포넌트 인스턴스가 동시에 마운트돼도 <style> 태그를
// 한 번만 주입한다(모듈 전역 Set으로 추적). css는 모듈 스코프 상수
// 문자열이어야 한다 — 렌더마다 새로 만들어지는 문자열을 넘기면 매번
// effect가 다시 실행된다(비교 대상이 매번 새 참조라서).
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
