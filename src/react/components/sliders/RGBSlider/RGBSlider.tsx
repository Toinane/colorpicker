import { FunctionComponent, JSX, useMemo, useCallback } from 'react'
import classNames from 'classnames'
import Color from 'colorjs.io'

import { useColorStore } from '@react/stores/colorStore'

import Slider from '@components/sliders/slider'
import NumberInput from '@react/components/inputs/numberInput/numberInput'

import './RGBSlider.css'

const RGBSlider: FunctionComponent = (): JSX.Element => {
  const color = useColorStore((state) => state.color)
  const rgb = useMemo(() => color.srgb, [color])

  const handleChange = useCallback(
    (channel: 'r' | 'g' | 'b', value: number) => {
      useColorStore
        .getState()
        .setColor(
          new Color('srgb', [
            channel === 'r' ? value / 255 : rgb.r,
            channel === 'g' ? value / 255 : rgb.g,
            channel === 'b' ? value / 255 : rgb.b,
          ]),
        )
    },
    [rgb],
  )

  return (
    <section
      className={classNames('RGBSlider', { DARK: useColorStore((state) => state.isDarkColor) })}
    >
      <section className="slider">
        <Slider
          type="redGradient"
          min={0}
          max={255}
          value={Math.round(rgb.r * 255)}
          onChange={(value) => handleChange('r', value)}
        />
        <NumberInput
          min={0}
          max={255}
          value={Math.round(rgb.r * 255)}
          onChange={(value) => handleChange('r', value)}
        />
      </section>
      <section className="slider">
        <Slider
          type="greenGradient"
          min={0}
          max={255}
          value={Math.round(rgb.g * 255)}
          onChange={(value) => handleChange('g', value)}
        />
        <NumberInput
          min={0}
          max={255}
          value={Math.round(rgb.g * 255)}
          onChange={(value) => handleChange('g', value)}
        />
      </section>
      <section className="slider">
        <Slider
          type="blueGradient"
          min={0}
          max={255}
          value={Math.round(rgb.b * 255)}
          onChange={(value) => handleChange('b', value)}
        />
        <NumberInput
          min={0}
          max={255}
          value={Math.round(rgb.b * 255)}
          onChange={(value) => handleChange('b', value)}
        />
      </section>
    </section>
  )
}

export default RGBSlider
