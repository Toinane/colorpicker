import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import debounce from './debounce'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('debounce', () => {
  it('coalesces rapid calls into a single invocation', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced('a')
    debounced('b')
    debounced('c')

    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('c')
  })

  it('fires again after the delay elapses between calls', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced('a')
    vi.advanceTimersByTime(300)
    debounced('b')
    vi.advanceTimersByTime(300)

    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenNthCalledWith(1, 'a')
    expect(fn).toHaveBeenNthCalledWith(2, 'b')
  })

  it('defaults to a 300ms wait', () => {
    const fn = vi.fn()
    const debounced = debounce(fn)

    debounced('x')
    vi.advanceTimersByTime(299)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledWith('x')
  })
})
