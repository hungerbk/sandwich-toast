import { useSyncExternalStore } from 'react'
import { toast } from '../lib'
import { subscribe, getSnapshot } from '../lib/store'
import { Ingredient } from '../lib/components/Ingredient'
import './App.css'

const ALL_INGREDIENTS = ['lettuce', 'tomato', 'cheese', 'bread'] as const

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

      <h2>Ingredient preview</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '480px' }}>
        {ALL_INGREDIENTS.map((ingredient) => (
          <div key={ingredient} style={{ border: '1px solid #ddd' }}>
            <Ingredient ingredient={ingredient} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
