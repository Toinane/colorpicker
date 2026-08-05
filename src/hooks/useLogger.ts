import { useMemo } from 'react'
import { createScopedLogger } from '@common/logger'

/** Scoped logger tagged with `componentName`, memoized across re-renders. */
export function useLogger(componentName: string) {
  return useMemo(() => createScopedLogger(componentName), [componentName])
}
