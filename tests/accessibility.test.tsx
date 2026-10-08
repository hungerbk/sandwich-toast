import { act, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toaster, toast, toastLabels, type ToasterProps } from "../src/lib";
import { clearToasts } from "../src/lib/store";

let root: Root;
let container: HTMLDivElement;
let outside: HTMLButtonElement;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers();
  clearToasts();
  container = document.createElement("div");
  outside = document.createElement("button");
  document.body.append(container, outside);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  clearToasts();
  container.remove();
  outside.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
function mount(props: ToasterProps = {}) {
  act(() =>
    root.render(
      <StrictMode>
        <Toaster {...props} />
      </StrictMode>,
    ),
  );
}
function create(message: string) {
  let id = "";
  act(() => {
    id = toast.info(message, { duration: Infinity });
  });
  return id;
}
function button(id: string, close = false) {
  const element = document.querySelector<HTMLButtonElement>(
    `[data-toast-id="${id}"] .sandwich-toast-${close ? "dismiss" : "message"}-button`,
  );
  if (!element) throw new Error(`버튼 없음: ${id}`);
  return element;
}
const focus = (element: HTMLElement) => act(() => element.focus());
function key(key: string, options: KeyboardEventInit = {}) {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...options });
  act(() => document.activeElement!.dispatchEvent(event));
  return event;
}

describe("keyboard and focus", () => {
  it.each([
    "top-left",
    "top-center",
    "top-right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
  ] as const)("%s: 방향키는 시각 순서를 따르고 끝에서 멈춘다", (position) => {
    mount({ position });
    const a = create("a");
    const b = create("b");
    const c = create("c");
    focus(button(c));
    expect(key("ArrowUp").defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(button(c));
    key("ArrowDown");
    expect(document.activeElement).toBe(button(b));
    key("ArrowRight");
    expect(document.activeElement).toBe(button(b, true));
    key("ArrowLeft");
    expect(document.activeElement).toBe(button(b));
    key("ArrowDown");
    expect(document.activeElement).toBe(button(a));
    key("ArrowDown");
    expect(document.activeElement).toBe(button(a));
    act(() => button(a).click());
    key("ArrowDown");
    expect(document.activeElement).toBe(button(c));
  });

  it.each([
    ["Tab", {}],
    ["Enter", {}],
    [" ", {}],
    ["ArrowDown", { shiftKey: true }],
    ["ArrowDown", { ctrlKey: true }],
    ["ArrowDown", { altKey: true }],
    ["ArrowDown", { metaKey: true }],
    ["ArrowDown", { isComposing: true }],
  ] as const)("%s %j를 가로채지 않는다", (name, options) => {
    mount();
    const a = create("a");
    create("b");
    focus(button(a));
    expect(key(name, options).defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(button(a));
  });

  it("닫기 애니메이션 중인 카드는 방향키 탐색에서 제외한다", () => {
    mount();
    const a = create("a");
    const b = create("b");
    const c = create("c");
    const middle = button(b).closest<HTMLElement>("[data-toast-id]")!;
    const animation = { onfinish: null, cancel: vi.fn() };
    Object.defineProperty(middle, "animate", { configurable: true, value: vi.fn(() => animation) });
    act(() => toast.dismiss(b));
    expect(middle.isConnected).toBe(true);
    focus(button(c));
    key("ArrowDown");
    expect(document.activeElement).toBe(button(a));
  });

  it("비활성화된 메시지 버튼은 방향키 탐색에서 건너뛴다", () => {
    mount();
    const a = create("a");
    const b = create("b");
    const c = create("c");
    button(b).disabled = true;
    focus(button(c));
    key("ArrowDown");
    expect(document.activeElement).toBe(button(a));
  });

  it("닫힌 카드의 포커스를 다음 카드로 옮기고 마지막 삭제 후 외부로 복원한다", () => {
    mount();
    const a = create("a");
    const b = create("b");
    focus(outside);
    focus(button(a, true));
    act(() => button(a, true).click());
    expect(document.activeElement).toBe(button(b));
    act(() => button(b, true).click());
    expect(document.activeElement).toBe(outside);
  });

  it("사용자가 이미 옮긴 외부 포커스는 삭제 후에도 유지한다", () => {
    mount();
    const id = create("a");
    focus(button(id));
    focus(outside);
    act(() => toast.dismiss(id));
    expect(document.activeElement).toBe(outside);
  });

  it("영문 라벨과 사용자 문구가 버튼 및 연결된 설명에 반영된다", () => {
    mount({ ...toastLabels.en, reorderHint: "Custom keyboard hint" });
    const id = create("message");
    expect(button(id).type).toBe("button");
    expect(button(id, true).getAttribute("aria-label")).toBe("Close");
    const hintId = button(id).getAttribute("aria-describedby");
    expect(hintId).toBeTruthy();
    expect(document.getElementById(hintId!)?.textContent).toBe("Custom keyboard hint");
  });
});

describe("live region DOM contract (낭독 검증 아님)", () => {
  it("빈 영역을 먼저 만들고 일반 알림과 오류를 분리한다", () => {
    const normal = toast.info("일반 알림", { duration: Infinity });
    toast.error("오류 알림", { duration: Infinity });
    mount();
    const status = document.querySelector('[role="status"]')!;
    const alert = document.querySelector('[role="alert"]')!;
    expect(status.textContent).toBe("");
    expect(alert.textContent).toBe("");
    act(() => vi.advanceTimersByTime(0));
    expect(status.textContent).toBe("일반 알림");
    expect(alert.textContent).toBe("오류 알림");
    expect(status.getAttribute("aria-relevant")).toBe("additions text");
    const originalMessage = status.firstElementChild;
    act(() => button(normal).click());
    expect(status.firstElementChild).toBe(originalMessage);
    create("일반 알림");
    expect(status.children.length).toBe(2);
    expect(status.firstElementChild).toBe(originalMessage);
    act(() => toast.dismiss(normal));
    expect(status.children.length).toBe(1);
    expect(alert.textContent).toBe("오류 알림");
  });
});
