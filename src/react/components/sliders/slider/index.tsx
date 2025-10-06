import { FunctionComponent, JSX, useState, useEffect } from 'react'

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
  const [color, setColor] = useState(Number.isNaN(value) ? 0 : value)

  // Sync local state when prop changes
  useEffect(() => {
    setColor(Number.isNaN(value) ? 0 : value)
  }, [value])

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
      <progress className={[style.progress, style[type]].join(' ')} max={max} value={color} />
    </section>
  )
}

export default Slider
