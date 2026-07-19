import { useState } from "react";
import { toast, Toaster } from "../lib";
import { Ingredient } from "../lib/components/Ingredient";
import { useMeasuredRows } from "../lib/useMeasuredRows";
import "./App.css";

const ALL_INGREDIENTS = ["lettuce", "tomato", "cheese", "bread"] as const;

// 텍스트가 길어질수록 Ingredient의 rows가 늘어나는 걸 보여주는 미리보기.
function TextWrapPreview() {
  const [message, setMessage] = useState("상큼하게 성공!");
  // Ingredient 한 층의 대략적인 렌더링 높이(px). 데모용 추정치이며,
  // 실제 토스트 카드에서는 ToastItem이 재료 실측 높이로 맞춘다.
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

function App() {
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
