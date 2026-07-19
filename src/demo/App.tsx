import { useSyncExternalStore } from 'react'
import { toast } from '../lib'
import { subscribe, getSnapshot } from '../lib/store'
import './App.css'

// Toaster UI가 아직 없어서(#9) 큐 상태를 디버그 리스트로만 확인하는 임시 플레이그라운드.
function App() {
  const toasts = useSyncExternalStore(subscribe, getSnapshot)

  return (
    <div className="playground">
      <h1>sandwich-toast playground</h1>
      <button type="button" onClick={() => toast.success('제출 완료!')}>
        toast.success()
      </button>
      <button type="button" onClick={() => toast.tomato('서버 응답 없음')}>
        toast.tomato()
      </button>
      <button type="button" onClick={() => toast.success('귀여운 성공', { ingredient: 'tomato' })}>
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
    </div>
  )
}

export default App
