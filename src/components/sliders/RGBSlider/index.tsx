import { FunctionComponent, JSX } from 'preact';

import { redState, greenState, blueState } from '@stores/color';

import Slider from '../slider';
import NumberInput from '../numberInput';

import style from './style.module.css';

const RGBSlider: FunctionComponent = (): JSX.Element => (
  <section className={style.RGBSlider}>
    <section className={style.slider}>
      <Slider type="red" min={0} max={255} state={redState} />
      <NumberInput min={0} max={255} state={redState} />
    </section>
    <section className={style.slider}>
      <Slider type="green" min={0} max={255} state={greenState} />
      <NumberInput min={0} max={255} state={greenState} />
    </section>
    <section className={style.slider}>
      <Slider type="blue" min={0} max={255} state={blueState} />
      <NumberInput min={0} max={255} state={blueState} />
    </section>
  </section>
);

export default RGBSlider;
