import { act, StrictMode, useLayoutEffect } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useToastTimer } from '../src/lib/hooks/useToastTimer'
import { useToastStack } from '../src/lib/hooks/useToastStack'
import { clearToasts, getSnapshot, removeToast } from '../src/lib/store'
import { toast } from '../src/lib/toast'
import { TOAST_ITEM_TRANSITION_MS } from '../src/lib/components/ToastItem.styles'

let root: Root
let container: HTMLDivElement
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.useFakeTimers()
  clearToasts()
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})
afterEach(() => {
  act(() => root.unmount())
  clearToasts()
  container.remove()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms))

function timerHarness(strict: boolean) {
  let current: ReturnType<typeof useToastTimer>
  function Probe(props: Parameters<typeof useToastTimer>[0]) {
    const value = useToastTimer(props)
    useLayoutEffect(() => { current = value })
    return null
  }
  return {
    render(props: Parameters<typeof useToastTimer>[0]) {
      act(() => root.render(strict ? <StrictMode><Probe {...props} /></StrictMode> : <Probe {...props} />))
    },
    reset() { act(() => current.resetTimer()) },
  }
}

describe.each([false, true])('timer (StrictMode=%s)', strict => {
  it('최초 paused 마운트 후 재개하면 전체 유효시간을 보장한다', () => {
    const harness = timerHarness(strict)
    const onElapsed = vi.fn()
    harness.render({ duration: 4000, isPaused: true, onElapsed })
    advance(10000)
    expect(onElapsed).not.toHaveBeenCalled()
    harness.render({ duration: 4000, isPaused: false, onElapsed })
    advance(3999)
    expect(onElapsed).not.toHaveBeenCalled()
    advance(1)
    expect(onElapsed).toHaveBeenCalledTimes(1)
  })

  it('반복 pause/resume은 남은 시간만 이어서 센다', () => {
    const harness = timerHarness(strict)
    const onElapsed = vi.fn()
    const render = (isPaused: boolean) => harness.render({ duration: 4000, isPaused, onElapsed })
    render(false)
    advance(1000)
    render(true)
    advance(9000)
    render(false)
    advance(1000)
    render(true)
    advance(9000)
    render(false)
    advance(1999)
    expect(onElapsed).not.toHaveBeenCalled()
    advance(1)
    expect(onElapsed).toHaveBeenCalledTimes(1)
  })

  it.each([false, true])('reset은 전체 시간을 다시 센다 (paused=%s)', paused => {
    const harness = timerHarness(strict)
    const onElapsed = vi.fn()
    harness.render({ duration: 4000, isPaused: false, onElapsed })
    advance(3000)
    harness.render({ duration: 4000, isPaused: paused, onElapsed })
    harness.reset()
    if (paused) {
      advance(10000)
      expect(onElapsed).not.toHaveBeenCalled()
      harness.render({ duration: 4000, isPaused: false, onElapsed })
    }
    advance(3999)
    expect(onElapsed).not.toHaveBeenCalled()
    advance(1)
    expect(onElapsed).toHaveBeenCalledTimes(1)
  })

  it('콜백 변경은 수명을 연장하지 않고 최신 콜백을 호출한다', () => {
    const harness = timerHarness(strict)
    const oldCallback = vi.fn()
    const latestCallback = vi.fn()
    harness.render({ duration: 4000, isPaused: false, onElapsed: oldCallback })
    advance(3000)
    harness.render({ duration: 4000, isPaused: false, onElapsed: latestCallback })
    advance(1000)
    expect(oldCallback).not.toHaveBeenCalled()
    expect(latestCallback).toHaveBeenCalledTimes(1)
  })

  it.each([undefined, Infinity])('duration %s는 자동 종료하지 않는다', duration => {
    const harness = timerHarness(strict)
    const onElapsed = vi.fn()
    harness.render({ duration, isPaused: false, onElapsed })
    harness.reset()
    advance(100000)
    expect(onElapsed).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('언마운트 시 자동 종료 타이머를 해제한다', () => {
    const harness = timerHarness(strict)
    const onElapsed = vi.fn()
    harness.render({ duration: 4000, isPaused: false, onElapsed })
    act(() => root.render(null))
    expect(vi.getTimerCount()).toBe(0)
    advance(10000)
    expect(onElapsed).not.toHaveBeenCalled()
  })
})

function stackHarness() {
  let current: ReturnType<typeof useToastStack>
  function Probe() {
    const value = useToastStack()
    useLayoutEffect(() => { current = value })
    return null
  }
  act(() => root.render(<StrictMode><Probe /></StrictMode>))
  return () => current
}

describe('stack lifecycle', () => {
  it('재정렬은 store 순서를 바꾸지 않고 새 카드와 삭제를 반영한다', () => {
    const a = toast.info('a')
    const b = toast.info('b')
    const read = stackHarness()
    expect(read().visualOrder).toEqual([b, a])
    act(() => read().bringToFront(a))
    expect(read().visualOrder).toEqual([a, b])
    expect(getSnapshot().map(item => item.id)).toEqual([a, b])
    let c: string
    act(() => { c = toast.info('c') })
    expect(read().visualOrder).toEqual([c!, a, b])
    act(() => read().setHoveredId(a))
    act(() => removeToast(a))
    expect(read().visualOrder).toEqual([c!, b])
    expect(read().hoveredId).toBeNull()
    expect(read().rankOf.has(a)).toBe(false)
  })

  it('연속 재정렬은 이전 타이머를 취소하고 마지막 요청까지 settling을 유지한다', () => {
    const a = toast.info('a')
    const b = toast.info('b')
    const read = stackHarness()
    const settleMs = TOAST_ITEM_TRANSITION_MS + 20
    act(() => read().bringToFront(a))
    advance(settleMs - 1)
    act(() => read().bringToFront(b))
    expect(vi.getTimerCount()).toBe(1)
    advance(1)
    expect(read().isSettling).toBe(true)
    advance(settleMs - 2)
    expect(read().isSettling).toBe(true)
    advance(1)
    expect(read().isSettling).toBe(false)
  })

  it('재정렬 중 언마운트하면 settling 타이머를 해제한다', () => {
    const id = toast.info('a')
    const read = stackHarness()
    act(() => read().bringToFront(id))
    act(() => root.render(null))
    expect(vi.getTimerCount()).toBe(0)
  })

  it('반복 생성·재정렬·삭제 후 시각 순서와 hover 상태가 남지 않는다', () => {
    const read = stackHarness()
    for (let i = 0; i < 10; i++) {
      let id: string
      act(() => { id = toast.info('알림') })
      act(() => { read().bringToFront(id!); read().setHoveredId(id!) })
      act(() => removeToast(id!))
      expect(read().visualOrder).toEqual([])
      expect(read().rankOf.size).toBe(0)
      expect(read().hoveredId).toBeNull()
    }
  })
})
