import { act, StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toaster, toast } from "../src/lib";
import { clearToasts } from "../src/lib/store";

let container: HTMLDivElement;
let root: Root | undefined;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers();
  clearToasts();
  container = document.createElement("div");
  document.body.append(container);
});
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  clearToasts();
  container.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe.each([false, true])("hydration (StrictMode=%s)", (strict) => {
  it("서버 HTML을 유지하고 기존 알림을 portal에 표시한다", async () => {
    const app = (
      <main>
        <h1>앱</h1>
        <Toaster nonce="test-nonce" />
      </main>
    );
    const tree = strict ? <StrictMode>{app}</StrictMode> : app;
    container.innerHTML = renderToString(tree);
    const heading = container.querySelector("h1");
    expect(container.querySelector(".sandwich-toaster")).toBeNull();
    const id = toast.info("hydration 이전 알림");
    const onRecoverableError = vi.fn();
    const errors = vi.spyOn(console, "error");
    await act(async () => {
      root = hydrateRoot(container, tree, { onRecoverableError });
    });
    expect(container.querySelector("h1")).toBe(heading);
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(errors).not.toHaveBeenCalled();
    const card = document.querySelector(`[data-toast-id="${id}"]`);
    expect(card).not.toBeNull();
    expect(container.contains(card)).toBe(false);
    const styles = document.head.querySelectorAll<HTMLStyleElement>("style[data-sandwich-toast]");
    expect(styles.length).toBeGreaterThan(0);
    styles.forEach((style) => {
      expect(style.nonce).toBe("test-nonce");
    });
    act(() => vi.advanceTimersByTime(4000));
    expect(document.querySelector(`[data-toast-id="${id}"]`)).toBeNull();
    act(() => root!.unmount());
    root = undefined;
    expect(document.querySelector(".sandwich-toaster")).toBeNull();
  });
});
