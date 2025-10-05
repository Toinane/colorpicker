import { FunctionComponent, JSX } from 'react'

// import { redState, greenState, blueState } from '@stores/color';

import Slider from '../slider'
import NumberInput from '../numberInput'

import style from './style.module.css'

const RGBSlider: FunctionComponent = (): JSX.Element => (
  <section className={style.RGBSlider}>
    <section className={style.slider}>
      <Slider type="red" min={0} max={255} state={0} />
      <NumberInput min={0} max={255} state={0} />
    </section>
    <section className={style.slider}>
      <Slider type="green" min={0} max={255} state={0} />
      <NumberInput min={0} max={255} state={0} />
    </section>
    <section className={style.slider}>
      <Slider type="blue" min={0} max={255} state={0} />
      <NumberInput min={0} max={255} state={0} />
    </section>
  </section>
)

export default RGBSlider
