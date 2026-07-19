import { toast } from '../lib'
import './App.css'

function App() {
  return (
    <div className="playground">
      <h1>sandwich-toast playground</h1>
      <button type="button" onClick={() => toast.log('Hello from sandwich-toast!')}>
        Trigger stub toast
      </button>
    </div>
  )
}

export default App
