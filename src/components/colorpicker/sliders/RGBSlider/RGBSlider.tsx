import { FunctionComponent, JSX, useMemo, useCallback } from 'react'
import Color from 'colorjs.io'

import { useColorStore } from '@stores/colorStore'
import { useColorHistoryStore } from '@stores/colorHistoryStore'
import { toHex } from '@common/color'

import Slider from '@components/colorpicker/sliders/slider'
import NumberInput from '@components/colorpicker/inputs/numberInput/numberInput'

import './RGBSlider.css'

const RGBSlider: FunctionComponent = (): JSX.Element => {
  const color = useColorStore((state) => state.color)
  // NOTE: use getAll('srgb') rather than the color.srgb accessor - colorjs.io's
  // package.json sideEffects list omits src/space-accessors.js, so Vite's esbuild
  // pre-bundler tree-shakes that accessor away and color.srgb silently returns undefined.
  const [r, g, b] = useMemo(() => color.getAll({ space: 'srgb' }), [color])

  const handleChange = useCallback(
    (channel: 'r' | 'g' | 'b', value: number) => {
      const newColor = new Color('srgb', [
        channel === 'r' ? value / 255 : (r ?? 0),
        channel === 'g' ? value / 255 : (g ?? 0),
        channel === 'b' ? value / 255 : (b ?? 0),
      ])
      useColorStore.getState().setColor(newColor)
      // Manual manipulation history — independent of picker history (see
      // @stores/pickerHistoryStore); debounced internally, so a drag only
      // commits once it settles.
      useColorHistoryStore.getState().commitColor(toHex(newColor))
    },
    [r, g, b],
  )

  return (
    <section className={'RGBSlider'}>
      <section className="slider">
        <Slider
          type="redGradient"
          min={0}
          max={255}
          value={Math.round((r ?? 0) * 255)}
          onChange={(value) => handleChange('r', value)}
        />
        <NumberInput
          min={0}
          max={255}
          value={Math.round((r ?? 0) * 255)}
          onChange={(value) => handleChange('r', value)}
        />
      </section>
      <section className="slider">
        <Slider
          type="greenGradient"
          min={0}
          max={255}
          value={Math.round((g ?? 0) * 255)}
          onChange={(value) => handleChange('g', value)}
        />
        <NumberInput
          min={0}
          max={255}
          value={Math.round((g ?? 0) * 255)}
          onChange={(value) => handleChange('g', value)}
        />
      </section>
      <section className="slider">
        <Slider
          type="blueGradient"
          min={0}
          max={255}
          value={Math.round((b ?? 0) * 255)}
          onChange={(value) => handleChange('b', value)}
        />
        <NumberInput
          min={0}
          max={255}
          value={Math.round((b ?? 0) * 255)}
          onChange={(value) => handleChange('b', value)}
        />
      </section>
    </section>
  )
}

export default RGBSlider
