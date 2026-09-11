import { useEffect, useRef, useState } from "react";

interface ToastTimerOptions {
  duration?: number;
  isPaused: boolean;
  onElapsed: () => void;
}

export function useToastTimer({ duration, isPaused, onElapsed: handleDismiss }: ToastTimerOptions) {
  // 렌더마다 handleDismiss가 새로 만들어지므로, 이 함수를 effect의
  // dependency로 넣으면 매 렌더마다 타이머가 리셋돼서 영영 안 울린다.
  // 그렇다고 deps를 비워서 첫 렌더의 handleDismiss를 그대로 굳혀버리면
  // 클로저가 오래된 props를 참조하게 된다. ref에 최신 함수를 담아두고
  // effect 안에서는 ref로만 호출하면 두 문제 다 피할 수 있다.
  // ref.current 갱신 자체도 렌더링 도중이 아니라 커밋 이후(effect)에
  // 해야 한다 — 렌더 도중 ref를 직접 mutate하면, 그 렌더가 커밋되지
  // 않고 버려지는 경우(concurrent 기능 사용 시)에도 mutation은 되돌려지지
  // 않아서 실제 화면과 ref가 어긋날 수 있다. deps 없는 effect는 매
  // 커밋 후 실행되므로 duration effect와 별개로 항상 최신 상태를 유지한다.
  const handleDismissRef = useRef(handleDismiss);
  useEffect(() => {
    handleDismissRef.current = handleDismiss;
  });

  // 클릭해서 맨 앞으로 가져오면 duration을 처음부터 다시 센다. 이 카드가
  // 직접 받는 클릭 이벤트로 트리거하므로(아래 handleClick) 호버 상태와는
  // 무관하게 동작한다 — 스택을 가로질러 다른 토스트를 클릭하러 가는 길에
  // 이 토스트를 스쳐 지나가는 것과 완전히 분리된 신호다.
  const [resetSignal, setResetSignal] = useState(0);
  // 자동 삭제까지 남은 시간을 "다음 dismiss 예정 시각"(절대 타임스탬프)으로
  // 추적한다 — 그래야 호버로 멈췄다가 다시 풀렸을 때, 멈춰있던 만큼만
  // 시각을 뒤로 미루면 되고(경과한 시간은 그대로 유지) setTimeout을 몇 ms로
  // 다시 걸어야 하는지도 이 값에서 바로 계산된다. 스택이 겹쳐 있어서 다른
  // 토스트로 가는 길에 이 토스트를 잠깐 스쳐 지나가는 것도 실제 호버로
  // 잡히는데, 이 방식이면 그 찰나의 pause는 그만큼만 시각을 미룰 뿐이라
  // 영향이 미미하다 — "언호버 시 무조건 처음부터 다시 시작"이었다면
  // 그 찰나의 스침마저 매번 duration을 통째로 리셋시켜서, 스택을
  // 가로지르기만 해도 지나친 토스트들이 한꺼번에 리셋되는 문제가 있었다.
  const targetTimeRef = useRef(0);
  // 멈춘 시각. 멈춰있지 않으면 null.
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
      // 멈췄다 풀린 경우: 멈춰있던 시간만큼 예정 시각을 뒤로 민다.
      targetTimeRef.current += Date.now() - pauseStartedAtRef.current;
      pauseStartedAtRef.current = null;
    } else {
      // 처음 시작하는 경우.
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
