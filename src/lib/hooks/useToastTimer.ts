import { useEffect, useRef, useState } from "react";

interface ToastTimerOptions {
  duration?: number;
  isPaused: boolean;
  onElapsed: () => void;
}

export function useToastTimer({ duration, isPaused, onElapsed: handleDismiss }: ToastTimerOptions) {
  // 타이머를 재시작하지 않고 마지막 커밋의 콜백을 호출한다.
  const handleDismissRef = useRef(handleDismiss);
  useEffect(() => {
    handleDismissRef.current = handleDismiss;
  });
  const [resetSignal, setResetSignal] = useState(0);
  // 호버 해제 시 남은 시간을 유지하고, 클릭 시에만 전체 시간을 다시 센다.
  const targetTimeRef = useRef(0);
  const pauseStartedAtRef = useRef<number | null>(null);
  const prevResetSignalRef = useRef(resetSignal);

  useEffect(() => {
    if (duration === undefined || !Number.isFinite(duration)) return;

    const isReset = resetSignal !== prevResetSignalRef.current;
    prevResetSignalRef.current = resetSignal;

    if (isReset) {
      targetTimeRef.current = Date.now() + duration;
      pauseStartedAtRef.current = isPaused ? Date.now() : null;
    } else if (isPaused) {
      pauseStartedAtRef.current = Date.now();
    } else if (pauseStartedAtRef.current !== null) {
      targetTimeRef.current += Date.now() - pauseStartedAtRef.current;
      pauseStartedAtRef.current = null;
    } else {
      targetTimeRef.current = Date.now() + duration;
    }

    if (isPaused) return;

    const remaining = Math.max(0, targetTimeRef.current - Date.now());
    const timer = setTimeout(() => handleDismissRef.current(), remaining);
    return () => clearTimeout(timer);
  }, [duration, isPaused, resetSignal]);

  const resetTimer = () => setResetSignal((n) => n + 1);

  return { resetTimer };
}
