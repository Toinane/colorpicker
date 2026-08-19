import { useLayoutEffect } from 'react'

// Flex-wrap has no CSS concept of "first/last item in a wrapped row", so a
// glued swatch strip can't get correct end-of-row rounding from :first-child
// / :last-child alone. This measures actual offsetTop per child to find real
// row boundaries and flags them with data attributes the CSS keys off.
export const useSwatchRowEdges = (
  containerRef: React.RefObject<HTMLElement | null>,
  enabled: boolean,
) => {
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    const clearEdges = () => {
      Array.from(container.children).forEach((child) => {
        child.removeAttribute('data-row-start')
        child.removeAttribute('data-row-end')
      })
    }

    if (!enabled) {
      clearEdges()
      return
    }

    const applyEdges = () => {
      const children = Array.from(container.children) as HTMLElement[]
      children.forEach((child, index) => {
        const isRowStart = index === 0 || children[index - 1].offsetTop !== child.offsetTop
        const isRowEnd =
          index === children.length - 1 || children[index + 1].offsetTop !== child.offsetTop
        child.toggleAttribute('data-row-start', isRowStart)
        child.toggleAttribute('data-row-end', isRowEnd)
      })
    }

    applyEdges()

    const observer = new ResizeObserver(applyEdges)
    observer.observe(container)

    return () => {
      observer.disconnect()
      clearEdges()
    }
  })
}
