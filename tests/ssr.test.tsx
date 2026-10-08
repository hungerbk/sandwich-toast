// @vitest-environment node
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'
import { Toaster, toast } from '../src/lib'
import { addToast, clearToasts, getSnapshot, getServerSnapshot } from '../src/lib/store'

afterEach(() => clearToasts())

describe('SSR without browser globals', () => {
  it('Toaster는 document/window 없이 빈 HTML로 렌더링된다', () => {
    expect(typeof window).toBe('undefined')
    expect(typeof document).toBe('undefined')
    expect(renderToString(createElement(Toaster))).toBe('')
  })

  it('서로 다른 렌더 요청의 toast 호출은 서버 store에 상태를 남기지 않는다', () => {
    function Request({ message }: { message: string }) {
      expect(toast.info(message)).toBe('')
      expect(toast.loading(message)).toBe('')
      return createElement(Toaster)
    }
    expect(renderToString(createElement(Request, { message: '첫 요청' }))).toBe('')
    expect(getSnapshot()).toEqual([])
    expect(renderToString(createElement(Request, { message: '다음 요청' }))).toBe('')
    expect(getSnapshot()).toEqual([])
    expect(getServerSnapshot()).toEqual([])
  })

  it('서버 dismiss는 내부 상태를 변경하지 않는다', () => {
    addToast({ id: 'existing', type: 'info', ingredient: 'bread', message: '내부 상태', duration: 4000, ketchup: false })
    const before = getSnapshot()
    toast.dismiss('existing')
    toast.dismiss()
    expect(getSnapshot()).toBe(before)
    expect(getServerSnapshot()).toEqual([])
    expect(renderToString(createElement(Toaster))).toBe('')
  })
})
