import { FunctionComponent, JSX } from 'preact';
import { RecoilState, useRecoilState } from 'recoil';
import { round } from 'culori';

import style from './style.module.css';

type SliderProps = {
  min?: number;
  max?: number;
  type: string;
  state: RecoilState<number>;
};

const Slider: FunctionComponent<SliderProps> = ({
  min = 0,
  max = 255,
  type,
  state,
}): JSX.Element => {
  const [color, setColor] = useRecoilState(state);

  const changeValue = (event: Event) => {
    setColor(event.target instanceof HTMLInputElement ? Number(event.target.value) / 255 : 0);
  };

  return (
    <section className={style.section}>
      <input
        className={style.input}
        type="range"
        min={min}
        max={max}
        value={round(1)(color * 255)}
        onInput={changeValue}
      />
      <progress
        className={[style.progress, style[type]].join(' ')}
        min={min}
        max={max}
        value={round(1)(color * 255)}
      />
    </section>
  );
};

export default Slider;
