import { toast, Toaster } from "../lib";
import { Ingredient } from "../lib/components/Ingredient";
import "./App.css";

const ALL_INGREDIENTS = ["lettuce", "tomato", "cheese", "bread"] as const;

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

      <Toaster />
    </div>
  );
}

export default App;
