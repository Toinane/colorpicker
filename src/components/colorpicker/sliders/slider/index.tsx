import { FunctionComponent, JSX } from 'react'
import classNames from 'clsx'

import { useColorStore } from '@stores/colorStore'
import { useControlledValue } from '@hooks/index'

import style from './slider.module.css'

type SliderProps = {
  min: number
  max: number
  type: string
  value: number
  onChange?: (value: number) => void
}

const Slider: FunctionComponent<SliderProps> = ({
  min,
  max,
  type,
  value,
  onChange,
}): JSX.Element => {
  const [color, setColor] = useControlledValue(Number.isNaN(value) ? 0 : value)
  const isDarkColor = useColorStore((state) => state.isDarkColor)

  const changeValue = (event: React.FormEvent<HTMLInputElement>) => {
    const newColor = event.target instanceof HTMLInputElement ? Number(event.target.value) : 0
    setColor(newColor)
    onChange?.(newColor)
  }

  return (
    <section className={style.section}>
      <input
        className={style.input}
        type="range"
        min={min}
        max={max}
        value={color}
        onInput={changeValue}
      />
      <progress
        className={classNames(style.progress, style[type], isDarkColor ? style.dark : style.light)}
        max={max}
        value={color}
      />
    </section>
  )
}

export default Slider
