import Color from 'colorjs.io'

import { toHex } from '@common/color'
import { Text } from '@components/ui'

import style from './colorItem.module.css'

// Light swatches need a much smaller nudge than dark ones do to stay
// subtle — the same delta reads as a barely-there outline on a dark color
// but as a harsh ring on a light one.
const DARK_BORDER_LIGHTNESS_DELTA = 5
const LIGHT_BORDER_LIGHTNESS_DELTA = -10

// Same shade as the swatch, just nudged darker (light colors) or lighter
// (dark colors) so the border stays visible against both the swatch and any
// background, instead of picking an unrelated fixed border color.
const getBorderColor = (hex: string): string => {
  const isDark = new Color(hex).contrast('#fff', 'WCAG21') > 3.5
  const delta = isDark ? DARK_BORDER_LIGHTNESS_DELTA : LIGHT_BORDER_LIGHTNESS_DELTA
  const bordered = new Color(hex).to('hsl').set({
    l: (l) => Math.min(100, Math.max(0, l + delta)),
  })
  return toHex(bordered)
}

const ColorItem = ({
  color,
  name,
  onClick,
}: {
  color: string
  name?: string
  onClick?: () => void
}) => {
  return (
    <section className={style.colorItemContainer}>
      <div
        className={style.colorItem}
        style={{ backgroundColor: color, borderColor: color ? getBorderColor(color) : undefined }}
        onClick={onClick}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            onClick()
          }
        }}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      ></div>
      {name && (
        <Text color="primary" size="small" className={style.colorName}>
          {name}
        </Text>
      )}
    </section>
  )
}

export default ColorItem
