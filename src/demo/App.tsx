import { useState, useSyncExternalStore } from "react";
import { toast } from "../lib";
import { subscribe, getSnapshot } from "../lib/store";
import { Ingredient } from "../lib/components/Ingredient";
import { ToastItem, TOAST_ITEM_TRANSITION_MS } from "../lib/components/ToastItem";
import { useMeasuredRows } from "../lib/useMeasuredRows";
import "./App.css";

const ALL_INGREDIENTS = ["lettuce", "tomato", "cheese", "bread"] as const;

// index 0 = 스택 맨 앞(최신), 마지막 index = 맨 뒤(가장 오래됨).
const MOCK_STACK = [
  { id: "a", ingredient: "lettuce", message: "상큼하게 성공!" } as const,
  { id: "b", ingredient: "tomato", message: "서버 응답이 없어요, 다시 시도해주세요" } as const,
  { id: "c", ingredient: "cheese", message: "조심하세요, 경고입니다" } as const,
];

// 호버한 토스트보다 앞에(위에) 쌓여있던 토스트들이 위로 비켜서 호버한
// 토스트가 잘 보이게 하고, 클릭하면 실제로 맨 앞 순서로 올라오는 미리보기.
// Toaster(#9)가 실제 큐로 이 흐름을 대체하게 될 것.
function HoverStackPreview() {
  // order[0]이 맨 앞(위). 클릭하면 이 배열 자체를 재정렬한다 — 토스트는
  // 많아야 몇 개라 배열 재정렬 비용은 신경 쓸 필요 없다.
  const [order, setOrder] = useState<string[]>(MOCK_STACK.map((t) => t.id));
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // 클릭으로 순서가 바뀌는 애니메이션 도중엔 pointer-events: none으로
  // 마우스 이벤트 자체를 막아둔다(아래 style). 안 그러면 마우스는 그대로
  // 있는데 요소들이 그 밑으로 슬라이드해 들어오면서 "새로 밑에 온 게
  // 호버된 것처럼" 보이는 혼란스러운 움직임이 생긴다.
  const [isSettling, setIsSettling] = useState(false);
  const RESTING_GAP = 40;
  const EXTRA_LIFT = 70;
  const SETTLE_MS = TOAST_ITEM_TRANSITION_MS + 20; // ToastItem의 transition 시간 + 약간의 여유

  const hoveredRank = hoveredId ? order.indexOf(hoveredId) : -1;

  const bringToFront = (id: string) => {
    setHoveredId(null);
    setIsSettling(true);
    setOrder((prev) => [id, ...prev.filter((x) => x !== id)]);
    setTimeout(() => setIsSettling(false), SETTLE_MS);
  };

  return (
    <div style={{ position: "relative", height: 420 }}>
      {order.map((id, rank) => {
        const t = MOCK_STACK.find((m) => m.id === id)!;
        return (
          <ToastItem
            key={id}
            ingredient={t.ingredient}
            message={t.message}
            onMouseEnter={() => setHoveredId(id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => bringToFront(id)}
            liftOffset={hoveredRank >= 0 && rank < hoveredRank ? EXTRA_LIFT : 0}
            style={{
              position: "absolute",
              top: rank * RESTING_GAP,
              left: 0,
              zIndex: order.length - rank,
              // isSettling 동안엔 마우스 이벤트 자체를 막아야 한다 — 형제
              // lift(hoveredRank)는 이미 막아뒀지만, ToastItem 내부의
              // isSelfHovered(자기 확대)는 부모의 isSettling을 모르기
              // 때문에 pointer-events로 원천 차단해야 재정렬 중 우연히
              // 마우스 밑에 들어온 토스트가 확대되는 걸 막을 수 있다.
              pointerEvents: isSettling ? "none" : "auto",
            }}
          />
        );
      })}
    </div>
  );
}

// 텍스트가 길어질수록 Ingredient의 rows가 늘어나는 걸 보여주는 미리보기.
// 실제로는 SandwichToast(#7)가 이 흐름을 조립해서 쓰게 될 것.
function TextWrapPreview() {
  const [message, setMessage] = useState("상큼하게 성공!");
  // Ingredient 한 층의 대략적인 렌더링 높이(px). 데모용 추정치이며,
  // 실제 토스트 카드에서는 SandwichToast가 재료 실측 높이로 맞출 예정.
  const ROW_HEIGHT_PX = 90;
  const { ref, rows } = useMeasuredRows<HTMLParagraphElement>(ROW_HEIGHT_PX);

  return (
    <div style={{ width: "320px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
      <p ref={ref} style={{ margin: 0, overflowWrap: "break-word", border: "1px dashed #aaa", padding: "4px" }}>
        {message}
      </p>
      <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>rows: {rows}</p>
      <Ingredient ingredient="lettuce" rows={rows} />
    </div>
  );
}

// Toaster UI가 아직 없어서(#9) 큐 상태를 디버그 리스트로만 확인하는 임시 플레이그라운드.
function App() {
  const toasts = useSyncExternalStore(subscribe, getSnapshot);

  return (
    <div className="playground">
      <h1>sandwich-toast playground</h1>
      <button type="button" onClick={() => toast.success("제출 완료!")}>
        toast.success()
      </button>
      <button type="button" onClick={() => toast.tomato("서버 응답 없음")}>
        toast.tomato()
      </button>
      <button type="button" onClick={() => toast.cheese("warning!")}>
        toast.cheese()
      </button>
      <button type="button" onClick={() => toast.info("이건 테스트용이에요")}>
        toast.info()
      </button>
      <button type="button" onClick={() => toast.success("귀여운 성공", { ingredient: "tomato" })}>
        toast.success() + ingredient override
      </button>
      <button type="button" onClick={() => toast.dismiss()}>
        toast.dismiss() (전체 삭제)
      </button>

      <ul>
        {toasts.map((t) => (
          <li key={t.id}>
            [{t.type}/{t.ingredient}] {t.message}
          </li>
        ))}
      </ul>

      <h2>Real queue preview (store 연결 + 삭제 버튼)</h2>
      <div style={{ position: "relative", minHeight: 400 }}>
        {toasts.map((t, i) => (
          <ToastItem key={t.id} ingredient={t.ingredient} message={t.message} onDismiss={() => toast.dismiss(t.id)} style={{ position: "absolute", top: i * 40, left: 0, zIndex: toasts.length - i }} />
        ))}
      </div>

      <h2>Ingredient preview</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "480px" }}>
        {ALL_INGREDIENTS.map((ingredient) => (
          <div key={ingredient} style={{ border: "1px solid #ddd" }}>
            <Ingredient ingredient={ingredient} />
          </div>
        ))}
      </div>

      <h2>Text wrap + rows preview</h2>
      <TextWrapPreview />

      <h2>Hover stack preview</h2>
      <HoverStackPreview />
    </div>
  );
}

export default App;
