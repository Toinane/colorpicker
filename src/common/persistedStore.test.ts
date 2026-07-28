import { describe, it, expect, vi, beforeEach } from 'vitest'

import { persistToStore, initializeStore, type InitializableState } from './persistedStore'

describe('persistToStore', () => {
  it('is a no-op when the store handle is null', async () => {
    await expect(persistToStore(null, { a: 1 })).resolves.toBeUndefined()
  })

  it('sets every entry then saves once', async () => {
    const calls: string[] = []
    const store = {
      set: vi.fn(async (key: string) => {
        calls.push(`set:${key}`)
      }),
      save: vi.fn(async () => {
        calls.push('save')
      }),
    }

    await persistToStore(store as never, { a: 1, b: 2 })

    expect(calls).toEqual(['set:a', 'set:b', 'save'])
  })
})

interface TestState extends InitializableState {
  value: string
}

const makeState = (overrides: Partial<TestState> = {}): TestState => ({
  value: '',
  isLoading: false,
  isInitialized: false,
  error: null,
  ...overrides,
})

describe('initializeStore', () => {
  let state: TestState
  const get = () => state
  const set = (patch: Partial<TestState>) => {
    state = { ...state, ...patch }
  }

  beforeEach(() => {
    state = makeState()
  })

  it('merges the loader result and flips isInitialized/isLoading', async () => {
    await initializeStore(get, set, async () => ({ value: 'loaded' }))

    expect(state).toEqual(makeState({ value: 'loaded', isInitialized: true }))
  })

  it('skips the loader entirely when already initialized', async () => {
    state = makeState({ value: 'existing', isInitialized: true })
    const loader = vi.fn(async () => ({ value: 'should-not-run' }))

    await initializeStore(get, set, loader)

    expect(loader).not.toHaveBeenCalled()
    expect(state.value).toBe('existing')
  })

  it('skips the loader entirely when already loading', async () => {
    state = makeState({ isLoading: true })
    const loader = vi.fn(async () => ({ value: 'should-not-run' }))

    await initializeStore(get, set, loader)

    expect(loader).not.toHaveBeenCalled()
  })

  it('records a thrown error and still finishes initializing (never stuck loading)', async () => {
    const onError = vi.fn()

    await initializeStore(
      get,
      set,
      async () => {
        throw new Error('boom')
      },
      onError,
    )

    expect(state.isInitialized).toBe(true)
    expect(state.isLoading).toBe(false)
    expect(state.error).toBe('Error: boom')
    expect(onError).toHaveBeenCalledTimes(1)
  })
})
