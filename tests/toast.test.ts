import { afterEach, describe, expect, it } from 'vitest'
import { toast } from '../src/lib/toast'
import { clearToasts, getSnapshot } from '../src/lib/store'

afterEach(() => clearToasts())

describe('toast API', () => {
  it.each([
    ['success', 'lettuce', 4000], ['error', 'tomato', 4000],
    ['warning', 'cheese', 4000], ['info', 'bread', 4000],
    ['loading', 'scrambled', Infinity],
  ] as const)('%s의 기본 재료와 duration', (type, ingredient, duration) => {
    const id = toast[type]('알림')
    expect(id).not.toBe('')
    expect(getSnapshot()).toEqual([{ id, message: '알림', type, ingredient, duration, ketchup: false }])
  })

  it.each([
    ['lettuce', 'success', 4000], ['tomato', 'error', 4000],
    ['cheese', 'warning', 4000], ['bread', 'info', 4000],
    ['scrambled', 'loading', Infinity],
  ] as const)('%s 별칭의 타입·재료·duration 기본값', (ingredient, type, duration) => {
    toast[ingredient]('재료 알림')
    expect(getSnapshot()[0]).toMatchObject({ ingredient, type, duration })
  })

  it('재료 메서드는 타입을 바꿔도 재료를 유지하며 옵션으로 덮어쓸 수 있다', () => {
    toast.scrambled('완료', { type: 'success' })
    toast.success('선택', { ingredient: 'tomato', ketchup: true, duration: 6000 })
    expect(getSnapshot()[0]).toMatchObject({ type: 'success', ingredient: 'scrambled', duration: 4000 })
    expect(getSnapshot()[1]).toMatchObject({ ingredient: 'tomato', ketchup: true, duration: 6000 })
    expect(getSnapshot()[0].id).not.toBe(getSnapshot()[1].id)
  })

  it.each([0, 1000, Infinity, 2 ** 31 - 1])('지원 duration %s를 유지한다', duration => {
    toast.loading('진행', { duration })
    expect(getSnapshot()[0].duration).toBe(duration)
  })

  it.each([-1, NaN, -Infinity, 2 ** 31])('유효하지 않은 duration %s는 타입 기본값으로 처리한다', duration => {
    toast.info('알림', { duration })
    toast.loading('진행', { duration })
    expect(getSnapshot().map(item => item.duration)).toEqual([4000, Infinity])
  })

  it('dismiss의 생략·undefined·없는 ID·지정 ID를 구분한다', () => {
    const first = toast.info('첫 번째')
    const second = toast.loading('두 번째')
    toast.dismiss(undefined)
    toast.dismiss('missing')
    expect(getSnapshot().map(item => item.id)).toEqual([first, second])
    toast.dismiss(first)
    expect(getSnapshot().map(item => item.id)).toEqual([second])
    toast.dismiss()
    expect(getSnapshot()).toEqual([])
  })
})
