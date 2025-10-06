import { FunctionComponent, JSX, useMemo, useCallback } from 'react'
import Color from 'colorjs.io'

import { useColorStore } from '@react/stores/color'

import Slider from '../slider'
import NumberInput from '../numberInput'

import style from './style.module.css'

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
    <section className={style.RGBSlider}>
      <section className={style.slider}>
        <Slider
          type="red"
          min={0}
          max={255}
          value={rgb.r * 255}
          onChange={(value) => handleChange('r', value)}
        />
        <NumberInput
          min={0}
          max={255}
          value={rgb.r * 255}
          onChange={(value) => handleChange('r', value)}
        />
      </section>
      <section className={style.slider}>
        <Slider
          type="green"
          min={0}
          max={255}
          value={rgb.g * 255}
          onChange={(value) => handleChange('g', value)}
        />
        <NumberInput
          min={0}
          max={255}
          value={rgb.g * 255}
          onChange={(value) => handleChange('g', value)}
        />
      </section>
      <section className={style.slider}>
        <Slider
          type="blue"
          min={0}
          max={255}
          value={rgb.b * 255}
          onChange={(value) => handleChange('b', value)}
        />
        <NumberInput
          min={0}
          max={255}
          value={rgb.b * 255}
          onChange={(value) => handleChange('b', value)}
        />
      </section>
    </section>
  )
}

export default RGBSlider
