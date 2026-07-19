import { useEffect, useRef, useState } from 'react'

// 메시지 텍스트가 실제로 몇 줄로 감싸졌는지(word-wrap) 측정해서, 재료가
// 몇 층 쌓여야 하는지(Ingredient의 rows) 계산한다. 폰트/줄바꿈 규칙을
// 직접 추정하는 대신 ResizeObserver로 렌더링된 실제 높이를 재기 때문에
// 폰트가 바뀌어도 항상 정확하다.
export function useMeasuredRows<T extends HTMLElement>(rowHeightPx: number) {
  const ref = useRef<T>(null)
  const [rows, setRows] = useState(1)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      const calculatedRows = rowHeightPx > 0 ? Math.ceil(entry.contentRect.height / rowHeightPx) : 1
      setRows(Math.max(1, calculatedRows))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [rowHeightPx])

  return { ref, rows }
}
