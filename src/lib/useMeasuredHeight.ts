import { useEffect, useRef, useState } from 'react'

// 메시지 텍스트의 실제 렌더링 콘텐츠 높이(px, padding 제외)와 줄 높이를
// 측정한다. ResizeObserver의 contentRect는 항상 padding/border를 뺀
// content-box 높이를 주므로, 이 값은 폰트가 무엇이든(상속되어 바뀌어도)
// 항상 정확하다. "몇 행이 필요한지"로의 변환은 재료 스택 기하를 아는
// Ingredient.rowsForContentHeight가 맡는다 — 이 훅은 순수 측정만 한다.
// lineHeight는 "카드가 최대 몇 줄까지 담을 수 있는지"를 역산할 때
// (재료 최대 행 수의 픽셀 용량 ÷ lineHeight) 쓰인다 — 그래야 말줄임표
// 기준(줄 수)이 실제 카드 용량과 항상 일치한다.
export function useMeasuredHeight<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [height, setHeight] = useState(0)
  const [lineHeight, setLineHeight] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      setHeight(entry.contentRect.height)
      setLineHeight(parseFloat(getComputedStyle(el).lineHeight) || 0)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, height, lineHeight }
}
