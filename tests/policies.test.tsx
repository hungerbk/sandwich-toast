import { act, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toaster, toast } from "../src/lib";
import { clearToasts } from "../src/lib/store";

let root: Root;
let container: HTMLDivElement;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  clearToasts();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  act(() => root.unmount());
  await Promise.resolve();
  clearToasts();
  container.remove();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("display policies", () => {
  it.each([
    [undefined, 1],
    [0, 1],
    [-1, 1],
    [NaN, 1],
    [Infinity, 1],
    [-Infinity, 1],
    [0.1, 0.5],
    [2, 1.5],
    [0.5, 0.5],
    [1.2, 1.2],
    [1.5, 1.5],
  ])("scale %s를 %s로 보정한다", (scale, expected) => {
    act(() => root.render(<Toaster scale={scale} />));
    const viewport = document.querySelector<HTMLElement>(".sandwich-toaster")!;
    expect(viewport.style.getPropertyValue("--sandwich-toast-scale")).toBe(String(expected));
  });

  it("활성 토스트를 대기열이나 개수 제한 없이 표시한다", () => {
    act(() => root.render(<Toaster />));
    act(() => {
      for (let i = 0; i < 30; i++) toast.loading(`알림 ${i}`);
    });
    expect(document.querySelectorAll("[data-toast-id]").length).toBe(30);
    act(() => toast.dismiss());
    expect(document.querySelectorAll("[data-toast-id]").length).toBe(0);
  });

  it("개발 환경에서 StrictMode 단일 마운트는 경고하지 않고 중복만 경고한다", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const render = async (duplicate: boolean) => {
      await act(async () => {
        root.render(
          <StrictMode>
            <Toaster key="a" />
            {duplicate && <Toaster key="b" />}
          </StrictMode>,
        );
      });
    };
    await render(false);
    expect(warn).not.toHaveBeenCalled();
    await render(true);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("Multiple <Toaster />");
    expect(document.querySelectorAll(".sandwich-toaster").length).toBe(2);
    await render(true);
    expect(warn).toHaveBeenCalledTimes(1);
    await render(false);
    await render(true);
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it("프로덕션 조건에서 중복 경고나 렌더링 차단을 하지 않는다", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await act(async () =>
      root.render(
        <>
          <Toaster />
          <Toaster />
        </>,
      ),
    );
    expect(warn).not.toHaveBeenCalled();
    expect(document.querySelectorAll(".sandwich-toaster").length).toBe(2);
  });
});
