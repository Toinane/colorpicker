import { Component, type ErrorInfo, type ReactNode } from 'react'

import { createScopedLogger } from '@common/logger'

const log = createScopedLogger('ErrorBoundary')

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Catches render errors so a single bad state (e.g. a corrupt persisted
 * store value) blanks a fallback screen instead of the whole native window
 * with no way back.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    log.error('Unhandled render error', {
      error: String(error),
      componentStack: info.componentStack,
    })
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '16px',
            fontFamily: 'sans-serif',
          }}
        >
          <strong>Something went wrong.</strong>
          <span>{this.state.error.message}</span>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
