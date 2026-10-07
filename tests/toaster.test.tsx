import { act, StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Toaster, toast } from '../src/lib'
import { clearToasts, getSnapshot } from '../src/lib/store'

let root: Root
let container: HTMLDivElement
let outside: HTMLButtonElement
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.useFakeTimers()
  clearToasts()
  container = document.createElement('div')
  outside = document.createElement('button')
  document.body.append(container, outside)
  root = createRoot(container)
})
afterEach(() => {
  act(() => root.unmount())
  clearToasts()
  container.remove()
  outside.remove()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})
function mount(strict: boolean) {
  act(() => root.render(strict ? <StrictMode><Toaster /></StrictMode> : <Toaster />))
}
function card(id: string) {
  const element = document.querySelector<HTMLElement>(`[data-toast-id="${id}"]`)
  if (!element) throw new Error(`토스트 없음: ${id}`)
  return element
}
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms))
const exists = (id: string) => document.querySelector(`[data-toast-id="${id}"]`) !== null
function create(message: string, duration = 4000) {
  let id = ''
  act(() => { id = toast.info(message, { duration }) })
  return id
}
const button = (id: string, selector: string) => {
  const result = card(id).querySelector<HTMLButtonElement>(selector)
  if (!result) throw new Error(`버튼 없음: ${selector}`)
  return result
}
function hover(id: string, entered: boolean) {
  act(() => card(id).dispatchEvent(new MouseEvent(entered ? 'mouseover' : 'mouseout', { bubbles: true, relatedTarget: outside })))
}

// jsdom은 WAAPI를 제공하지 않는다. 기본 시나리오는 미지원 fallback을 검증한다.
describe.each([false, true])('Toaster interactions (StrictMode=%s)', strict => {
  it('마운트 전에 생성한 알림도 자동 종료되고 portal은 body에 배치된다', () => {
    const id = create('초기 알림')
    mount(strict)
    expect(container.contains(card(id))).toBe(false)
    advance(3999)
    expect(exists(id)).toBe(true)
    advance(1)
    expect(exists(id)).toBe(false)
  })

  it('hover는 해당 카드만 멈추고 해제 후 남은 시간으로 종료한다', () => {
    mount(strict)
    const a = create('a')
    const b = create('b')
    advance(1000)
    hover(a, true)
    advance(4000)
    expect(exists(a)).toBe(true)
    expect(exists(b)).toBe(false)
    hover(a, false)
    advance(2999)
    expect(exists(a)).toBe(true)
    advance(1)
    expect(exists(a)).toBe(false)
  })

  it('메시지→닫기 버튼 포커스 이동 중에도 정지하며 외부 이동 후 재개한다', () => {
    mount(strict)
    const id = create('포커스')
    advance(1000)
    act(() => button(id, '.sandwich-toast-message-button').focus())
    advance(5000)
    act(() => button(id, '.sandwich-toast-dismiss-button').focus())
    advance(5000)
    expect(exists(id)).toBe(true)
    act(() => outside.focus())
    advance(2999)
    expect(exists(id)).toBe(true)
    advance(1)
    expect(exists(id)).toBe(false)
  })

  it('클릭 재정렬은 선택 카드만 재시작하고 다른 카드 수명을 유지한다', () => {
    mount(strict)
    const a = create('a')
    const b = create('b')
    advance(3000)
    act(() => button(a, '.sandwich-toast-message-button').click())
    expect(Number(card(a).style.zIndex)).toBeGreaterThan(Number(card(b).style.zIndex))
    advance(1000)
    expect(exists(b)).toBe(false)
    expect(exists(a)).toBe(true)
    advance(2999)
    expect(exists(a)).toBe(true)
    advance(1)
    expect(exists(a)).toBe(false)
  })

  it('loading은 자동 종료되지 않으며 API로 닫을 수 있다', () => {
    mount(strict)
    let id = ''
    act(() => { id = toast.loading('로딩') })
    advance(100000)
    expect(exists(id)).toBe(true)
    act(() => toast.dismiss(id))
    expect(exists(id)).toBe(false)
  })
})

function mockAnimation() {
  const animation = { onfinish: null as (() => void) | null, cancel: vi.fn() }
  const animate = vi.fn(() => animation)
  // 브라우저 애니메이션의 완료는 명시적으로 구동한다. 시각 효과는 검사하지 않는다.
  const previous = Object.getOwnPropertyDescriptor(Element.prototype, 'animate')
  Object.defineProperty(Element.prototype, 'animate', { configurable: true, value: animate })
  return { animation, animate, restore() {
    if (previous) Object.defineProperty(Element.prototype, 'animate', previous)
    else Reflect.deleteProperty(Element.prototype, 'animate')
  } }
}

describe('dismiss animation lifecycle', () => {
  it.each(['manual-first', 'timer-first'])('%s 경합에서 애니메이션은 한 번 실행되고 완료 후 제거된다', order => {
    const mock = mockAnimation()
    try {
      mount(true)
      const id = create('알림')
      advance(order === 'manual-first' ? 3999 : 4000)
      act(() => toast.dismiss(id))
      advance(1)
      expect(mock.animate).toHaveBeenCalledTimes(1)
      expect(exists(id)).toBe(true)
      act(() => mock.animation.onfinish?.())
      expect(exists(id)).toBe(false)
      expect(getSnapshot()).toEqual([])
    } finally { mock.restore() }
  })

  it('전체 삭제는 진행 중 애니메이션을 취소하고 완료 콜백을 제거한다', () => {
    const mock = mockAnimation()
    try {
      mount(false)
      const id = create('알림')
      act(() => toast.dismiss(id))
      act(() => toast.dismiss())
      expect(mock.animation.cancel).toHaveBeenCalledTimes(1)
      expect(mock.animation.onfinish).toBeNull()
      expect(exists(id)).toBe(false)
    } finally { mock.restore() }
  })

  it('Toaster 언마운트는 진행 중 애니메이션과 남은 종료 타이머를 정리한다', async () => {
    const mock = mockAnimation()
    try {
      mount(true)
      const id = create('닫기 중')
      create('대기 중')
      act(() => toast.dismiss(id))
      act(() => root.render(null))
      expect(mock.animation.cancel).toHaveBeenCalledTimes(1)
      expect(mock.animation.onfinish).toBeNull()
      advance(10000)
      expect(mock.animate).toHaveBeenCalledTimes(1)
      expect(document.querySelector('.sandwich-toaster')).toBeNull()
      await act(async () => { await Promise.resolve() })
      expect(getSnapshot().map(item => item.message)).toEqual(['대기 중'])
    } finally { mock.restore() }
  })

  it('모션 감소 설정에서는 애니메이션 없이 닫는다', () => {
    const mock = mockAnimation()
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))
    try {
      mount(false)
      const id = create('알림')
      act(() => button(id, '.sandwich-toast-dismiss-button').click())
      expect(mock.animate).not.toHaveBeenCalled()
      expect(exists(id)).toBe(false)
    } finally { mock.restore() }
  })
})
