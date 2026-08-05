import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

/**
 * Local state that mirrors an external `value`, so an input can show live
 * keystrokes before the parent's re-render round-trips back down, while
 * staying in sync if `value` changes for a reason other than the input
 * itself (e.g. a reset, or an edit made from another window).
 */
export function useControlledValue<T>(value: T): [T, Dispatch<SetStateAction<T>>] {
  const [local, setLocal] = useState(value)

  useEffect(() => {
    setLocal(value)
  }, [value])

  return [local, setLocal]
}
