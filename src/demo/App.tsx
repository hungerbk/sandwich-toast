import { useState } from "react";
import { toast, Toaster, type ToasterPosition } from "../lib";
import { Ingredient } from "../lib/components/Ingredient";
import "./App.css";

const ALL_INGREDIENTS = ["lettuce", "tomato", "cheese", "bread", "scrambled"] as const;
const ALL_POSITIONS: ToasterPosition[] = ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"];

function App() {
  const [position, setPosition] = useState<ToasterPosition>("top-center");

  return (
    <div className="playground">
      <h1>sandwich-toast playground</h1>

      <label>
        position:{" "}
        <select value={position} onChange={(e) => setPosition(e.target.value as ToasterPosition)}>
          {ALL_POSITIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>

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
      <button type="button" onClick={() => toast.loading("업로드 중...")}>
        toast.loading()
      </button>
      <button type="button" onClick={() => toast.loading("업로드 중...", { ingredient: "lettuce" })}>
        toast.loading() + ingredient override
      </button>
      <button type="button" onClick={() => toast.dismiss()}>
        toast.dismiss() (전체 삭제)
      </button>

      <h2>Ingredient preview</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "480px" }}>
        {ALL_INGREDIENTS.map((ingredient) => (
          <div key={ingredient} style={{ border: "1px solid #ddd" }}>
            <Ingredient ingredient={ingredient} isLoading={ingredient === "scrambled"} />
          </div>
        ))}
      </div>

      <Toaster position={position} />
    </div>
  );
}

export default App;
