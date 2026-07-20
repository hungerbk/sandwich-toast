import { useState } from "react";
import { toast, Toaster } from "../lib";
import { Ingredient } from "../lib/components/Ingredient";
import { rowsForContentHeight } from "../lib/rowGeometry";
import { TOAST_ITEM_WIDTH } from "../lib/components/ToastItem";
import { useMeasuredHeight } from "../lib/useMeasuredHeight";
import "./App.css";

const ALL_INGREDIENTS = ["lettuce", "tomato", "cheese", "bread"] as const;
const PREVIEW_PADDING = 4;

// 텍스트가 길어질수록 Ingredient의 rows가 늘어나는 걸 보여주는 미리보기.
function TextWrapPreview() {
  const [message, setMessage] = useState("상큼하게 성공!");
  const { ref, height } = useMeasuredHeight<HTMLParagraphElement>();
  const rows = rowsForContentHeight(height + PREVIEW_PADDING * 2, TOAST_ITEM_WIDTH);

  return (
    <div style={{ width: "320px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
      <p ref={ref} style={{ margin: 0, overflowWrap: "break-word", border: "1px dashed #aaa", padding: PREVIEW_PADDING }}>
        {message}
      </p>
      <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>rows: {rows}</p>
      <Ingredient ingredient="lettuce" rows={rows} />
    </div>
  );
}

function App() {
  return (
    <div className="playground">
      <h1>sandwich-toast playground</h1>
      <button type="button" onClick={() => toast.success("제출 완료!".repeat(100))}>
        toast.success()
      </button>
      <button type="button" onClick={() => toast.tomato("서버 응답 없음".repeat(100))}>
        toast.tomato()
      </button>
      <button type="button" onClick={() => toast.cheese("warning!".repeat(100))}>
        toast.cheese()
      </button>
      <button type="button" onClick={() => toast.info("이건 테스트용이에요".repeat(100))}>
        toast.info()
      </button>
      <button type="button" onClick={() => toast.success("귀여운 성공", { ingredient: "tomato" })}>
        toast.success() + ingredient override
      </button>
      <button type="button" onClick={() => toast.dismiss()}>
        toast.dismiss() (전체 삭제)
      </button>

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

      <Toaster />
    </div>
  );
}

export default App;
