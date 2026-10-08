import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addToast,
  clearToasts,
  getServerSnapshot,
  getSnapshot,
  removeToast,
  requestDismiss,
  subscribe,
} from "../src/lib/store";
import type { Toast } from "../src/lib/types";

const item = (id: string): Toast => ({
  id,
  message: id,
  type: "info",
  ingredient: "bread",
  duration: 4000,
  ketchup: false,
});
let subscriptions: Array<() => void> = [];
function listen(callback = vi.fn()) {
  const unsubscribe = subscribe(callback);
  subscriptions.push(unsubscribe);
  return unsubscribe;
}

beforeEach(() => clearToasts());
afterEach(async () => {
  subscriptions.forEach((unsubscribe) => unsubscribe());
  subscriptions = [];
  clearToasts();
  await Promise.resolve();
});

describe("store", () => {
  it("변경 전 snapshot을 유지하며 추가·삭제·전체 삭제를 알린다", () => {
    const listener = vi.fn();
    listen(listener);
    const empty = getSnapshot();
    addToast(item("a"));
    const first = getSnapshot();
    expect(getSnapshot()).toBe(first);
    addToast(item("b"));
    expect(empty).toEqual([]);
    expect(first.map((toast) => toast.id)).toEqual(["a"]);
    removeToast("a");
    expect(getSnapshot().map((toast) => toast.id)).toEqual(["b"]);
    clearToasts();
    expect(getSnapshot()).toEqual([]);
    expect(listener).toHaveBeenCalledTimes(4);
  });

  it("구독 해제 후 알리지 않고 없는 ID 삭제는 snapshot을 바꾸지 않는다", () => {
    const listener = vi.fn();
    const unsubscribe = listen(listener);
    addToast(item("a"));
    const snapshot = getSnapshot();
    removeToast("missing");
    requestDismiss("missing");
    expect(getSnapshot()).toBe(snapshot);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    addToast(item("b"));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("구독 중에는 닫기를 요청하고 중복 요청은 무시한다", () => {
    addToast(item("a"));
    const before = getSnapshot();
    const listener = vi.fn();
    listen(listener);
    requestDismiss("a");
    expect(before[0].dismissRequested).toBeUndefined();
    expect(getSnapshot()[0].dismissRequested).toBe(true);
    requestDismiss("a");
    expect(listener).toHaveBeenCalledTimes(1);
    removeToast("a");
    expect(getSnapshot()).toEqual([]);
  });

  it("표시할 구독자가 없으면 즉시 제거한다", () => {
    addToast(item("a"));
    requestDismiss("a");
    expect(getSnapshot()).toEqual([]);
  });

  it("마지막 구독 해제 후 닫기 요청만 정리한다", async () => {
    addToast(item("a"));
    addToast(item("b"));
    const unsubscribe = listen();
    requestDismiss("a");
    unsubscribe();
    await Promise.resolve();
    expect(getSnapshot().map((toast) => toast.id)).toEqual(["b"]);
  });

  it("즉시 재구독하면 진행 중인 닫기 요청을 보존한다", async () => {
    addToast(item("a"));
    const unsubscribe = listen();
    requestDismiss("a");
    unsubscribe();
    listen();
    await Promise.resolve();
    expect(getSnapshot()[0]?.dismissRequested).toBe(true);
  });

  it("서버 snapshot은 클라이언트 상태와 독립적인 안정된 빈 배열이다", () => {
    const server = getServerSnapshot();
    addToast(item("a"));
    expect(getServerSnapshot()).toBe(server);
    expect(server).toEqual([]);
  });
});
