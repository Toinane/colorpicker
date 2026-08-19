import { Children, cloneElement, isValidElement, useRef } from 'react'

import { Heading } from '@components/ui'
import type {
  ColorItemProps,
  ColorItemSize,
  ColorItemVariant,
} from '@components/palettes/colorItem/ColorItem'

import style from './colorSection.module.css'
import { useSwatchRowEdges } from './useSwatchRowEdges'

const ColorSection = ({
  children,
  label,
  variant = 'single',
  size = 'md',
  showNames = true,
  fullNames = false,
}: {
  children: React.ReactNode
  label?: string
  variant?: ColorItemVariant
  size?: ColorItemSize
  showNames?: boolean
  fullNames?: boolean
}) => {
  const containerRef = useRef<HTMLElement>(null)
  useSwatchRowEdges(containerRef, variant === 'swatch')

  return (
    <section className={style.colorSection}>
      {label && (
        <Heading level={2} color="primary" weight="semibold" className={style.label}>
          {label}
        </Heading>
      )}
      <section ref={containerRef} className={style.colors} data-variant={variant}>
        {Children.map(children, (child) =>
          isValidElement<ColorItemProps>(child)
            ? cloneElement(child, { variant, size, showName: showNames, fullName: fullNames })
            : child,
        )}
      </section>
    </section>
  )
}

export default ColorSection
