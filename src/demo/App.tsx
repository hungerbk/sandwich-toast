import { useState, useSyncExternalStore } from "react";
import { toast } from "../lib";
import { subscribe, getSnapshot } from "../lib/store";
import { Ingredient } from "../lib/components/Ingredient";
import { ToastItem } from "../lib/components/ToastItem";
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
// 토스트가 잘 보이게 하는 미리보기. Toaster(#9)가 실제 큐로 이 흐름을
// 대체하게 될 것.
function HoverStackPreview() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const RESTING_GAP = 40;
  const EXTRA_LIFT = 70;

  return (
    <div style={{ position: "relative", height: 420 }}>
      {MOCK_STACK.map((t, i) => (
        <ToastItem
          key={t.id}
          ingredient={t.ingredient}
          message={t.message}
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(null)}
          liftOffset={hoveredIndex !== null && i < hoveredIndex ? EXTRA_LIFT : 0}
          style={{ position: "absolute", top: i * RESTING_GAP, left: 0, zIndex: MOCK_STACK.length - i }}
        />
      ))}
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
