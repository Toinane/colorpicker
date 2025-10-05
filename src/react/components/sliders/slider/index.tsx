import { FunctionComponent, JSX, useState } from 'react'
// import { RecoilState, useRecoilState } from 'recoil';
// import { round } from 'culori';

import style from './style.module.css'

type SliderProps = {
  min?: number
  max?: number
  type: string
  state: number // RecoilState<number>;
}

const Slider: FunctionComponent<SliderProps> = ({
  min = 0,
  max = 255,
  type,
  state,
}): JSX.Element => {
  const [color, setColor] = useState(state)

  const changeValue = (event: React.FormEvent<HTMLInputElement>) => {
    setColor(event.target instanceof HTMLInputElement ? Number(event.target.value) / 255 : 0)
  }

  return (
    <section className={style.section}>
      <input
        className={style.input}
        type="range"
        min={min}
        max={max}
        value={Math.round(color * 255)}
        onInput={changeValue}
      />
      <progress
        className={[style.progress, style[type]].join(' ')}
        max={max}
        value={Math.round(color * 255)}
      />
    </section>
  )
}

export default Slider
