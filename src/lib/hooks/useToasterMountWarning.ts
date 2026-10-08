import { useEffect } from "react";

declare const process: { env: { NODE_ENV?: string } };

let mountedCount = 0;
let warned = false;

function checkDuplicateMounts() {
  if (mountedCount <= 1) {
    warned = false;
    return;
  }
  if (warned) return;
  warned = true;
  console.warn(
    "Sandwich Toast: Multiple <Toaster /> instances detected. Mount only one <Toaster /> at the top level of your app.",
  );
}

export function useToasterMountWarning() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    mountedCount += 1;
    // Strict Mode의 cleanup·재마운트가 끝난 뒤 실제 동시 마운트 수를 확인한다.
    queueMicrotask(checkDuplicateMounts);

    return () => {
      mountedCount -= 1;
      queueMicrotask(checkDuplicateMounts);
    };
  }, []);
}
