import { useRef, useState } from "react";
import { toast, Toaster, type ToastIngredient, type ToastType, type ToasterPosition } from "../lib";
import bread from "../lib/assets/bread.webp";
import lettuce from "../lib/assets/lettuce.webp";
import tomato from "../lib/assets/tomato.webp";
import cheese from "../lib/assets/cheese.webp";
import scrambled from "../lib/assets/scrambled.webp";
import "./App.css";

const MENU: { ingredient: ToastIngredient; name: string; caption: string; message: string; image: string; status: ToastType }[] = [
  { ingredient: "bread", name: "폭신한 빵", caption: "따끈따끈한 새 소식", message: "따끈따끈한 새 소식이 도착했어요!", image: bread, status: "info" },
  { ingredient: "lettuce", name: "아삭한 상추", caption: "기분 좋은 초록빛", message: "아삭한 상추, 주문에 추가했어요!", image: lettuce, status: "success" },
  { ingredient: "tomato", name: "싱싱한 토마토", caption: "잠깐, 확인해주세요", message: "앗, 토마토가 굴러갔어요! 다시 시도해주세요.", image: tomato, status: "error" },
  { ingredient: "cheese", name: "고소한 치즈", caption: "우유 알레르기 주의", message: "우유 알레르기가 있다면 치즈는 빼주세요!", image: cheese, status: "warning" },
  { ingredient: "scrambled", name: "몽글몽글한 스크램블 에그", caption: "맛있게 준비하는 중", message: "스크램블 에그를 만들고 있어요…", image: scrambled, status: "loading" },
];
const POSITIONS: { value: ToasterPosition; label: string }[] = [
  { value: "top-left", label: "왼쪽 위" }, { value: "top-center", label: "가운데 위" }, { value: "top-right", label: "오른쪽 위" },
  { value: "bottom-left", label: "왼쪽 아래" }, { value: "bottom-center", label: "가운데 아래" }, { value: "bottom-right", label: "오른쪽 아래" },
];

const SCALE = { min: 0.5, max: 1.5, step: 0.1, default: 1 };

function App() {
  const [position, setPosition] = useState<ToasterPosition>("top-center");
  const [scale, setScale] = useState(SCALE.default);
  const [selected, setSelected] = useState(MENU[0]);
  const [apiMode, setApiMode] = useState<"ingredient" | "status">("ingredient");
  const [orders, setOrders] = useState(0);
  const [copyMessage, setCopyMessage] = useState("");
  const loadingId = useRef<string | null>(null);
  const copyRequest = useRef(0);
  const method = apiMode === "ingredient" ? selected.ingredient : selected.status;
  const code = `import { toast, Toaster } from "sandwich-toast";\n\n<Toaster position="${position}" scale={${scale}} />\n\ntoast.${method}(${JSON.stringify(selected.message)});`;

  const choose = (item: typeof MENU[number]) => {
    setSelected(item);
    setOrders(count => count + 1);
    copyRequest.current++;
    setCopyMessage("");
    if (item.ingredient === "scrambled") {
      if (loadingId.current) toast.dismiss(loadingId.current);
      loadingId.current = toast.scrambled(item.message);
    } else {
      toast[item.ingredient](item.message);
    }
  };
  const copy = async () => {
    const request = ++copyRequest.current;
    try {
      await navigator.clipboard.writeText(code);
      if (request === copyRequest.current) setCopyMessage("코드를 복사했어요.");
    } catch {
      if (request === copyRequest.current) setCopyMessage("복사하지 못했어요. 아래 코드를 직접 선택해주세요.");
    }
  };
  const resetCopy = () => { copyRequest.current++; setCopyMessage(""); };

  return (
    <div className="shop-page">
      <a className="skip-link" href="#ingredients">재료 선택으로 건너뛰기</a>
      <header className="shop-header">
        <a className="wordmark" href="#">sandwich<span>toast</span></a>
        <span className="header-note">작은 알림을 맛있게.</span>
        <a className="github-link" href="https://github.com/hungerbk/sandwich-toast">GitHub ↗</a>
      </header>
      <main>
        <section className="control-bar" aria-label="토스트 설정">
          <div className="counter-badge"><span>ORDER NO.</span><strong>{String(orders).padStart(3, "0")}</strong></div>
          <label className="position-control">서빙 위치
            <select value={position} onChange={e => { setPosition(e.target.value as ToasterPosition); resetCopy(); }}>
              {POSITIONS.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label className="scale-control">한 입 크기 <output>{scale.toFixed(1)}×</output>
            <input type="range" min={SCALE.min} max={SCALE.max} step={SCALE.step} value={scale} onChange={e => { setScale(Number(e.target.value)); resetCopy(); }} />
          </label>
          <button type="button" className="clear-button" onClick={() => { toast.dismiss(); loadingId.current = null; }}>전체 비우기 <span aria-hidden="true">×</span></button>
        </section>

        <section className="storefront" aria-labelledby="shop-title">
          <div className="awning" aria-hidden="true" />
          <div className="shop-intro">
            <span className="open-sign">OPEN DAILY<br /><strong>FRESH TOASTS</strong></span>
            <p className="eyebrow">THE LITTLE NOTIFICATION DELI</p>
            <h1 id="shop-title">어떤 재료를<br /><em>넣어볼까요?</em></h1>
            <p className="intro-description">좋아하는 재료를 톡!<br className="mobile-break" /> 나만의 샌드위치 알림이 쌓여요.</p>
            <span className="shop-stamp" aria-hidden="true">MADE WITH<br /><strong>React</strong><br />SERVED WITH JOY</span>
          </div>
          <div className="menu-heading" id="ingredients" tabIndex={-1}><h2>오늘의 재료</h2><span>하나씩 눌러 맛보세요</span></div>
          <div className="ingredient-menu">
            {MENU.map((item, index) => <button key={item.ingredient} type="button" aria-pressed={selected.ingredient === item.ingredient} className={`menu-item menu-item--${item.status} ${selected.ingredient === item.ingredient ? "is-selected" : ""}`} onClick={() => choose(item)}>
              <span className="menu-number">0{index + 1}</span>
              <span className="ingredient-dish"><img src={item.image} alt="" width="180" height="130" /></span>
              <strong>{item.name}</strong><span className="menu-caption">{item.caption}</span>
              <span className={`flavor flavor--${item.status}`}>{item.status}<span aria-hidden="true">＋</span></span>
            </button>)}
          </div>
          <div className="counter-edge"><span>FRESH INGREDIENTS, HAPPY LITTLE MOMENTS.</span><span aria-hidden="true">✦</span></div>
        </section>
        <section className="recipe" aria-labelledby="recipe-title">
          <div className="recipe-intro"><span className="eyebrow">TAKE THE RECIPE HOME</span><h2 id="recipe-title">마음에 드셨나요?<br />코드도 챙겨가세요.</h2><p>방금 고른 재료와 서빙 설정 그대로.<br />당신의 React 앱에서도 만나보세요.</p><span className="recipe-tag">오늘의 선택 · {selected.name}</span></div>
          <div className="code-panel">
            <fieldset className="api-mode">
              <legend className="visually-hidden">코드 호출 방식</legend>
              <label><input type="radio" name="api-mode" value="ingredient" checked={apiMode === "ingredient"} onChange={() => { setApiMode("ingredient"); resetCopy(); }} /><span>재료로 사용</span></label>
              <label><input type="radio" name="api-mode" value="status" checked={apiMode === "status"} onChange={() => { setApiMode("status"); resetCopy(); }} /><span>상태로 사용</span></label>
            </fieldset>
            <div className="code-heading"><span>your-order.tsx</span><button type="button" onClick={copy}>코드 복사</button></div><pre tabIndex={0} aria-label="선택한 토스트 사용 코드"><code>{code}</code></pre><p className="copy-feedback" role="status">{copyMessage}</p></div>
        </section>
      </main>
      <footer className="shop-footer"><span>sandwich-toast</span><span>작은 알림에도, 취향 한 조각.</span><a href="https://github.com/hungerbk/sandwich-toast">소스 코드 보기 ↗</a></footer>
      <Toaster position={position} scale={scale} />
    </div>
  );
}
export default App;
