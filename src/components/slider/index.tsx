import { FunctionComponent, JSX } from 'preact';
import { useState } from 'preact/hooks';

import style from './style.module.css';

type SliderProps = {
  min?: number;
  max?: number;
  value?: number;
  type?: string;
};

const Slider: FunctionComponent<SliderProps> = ({
  min = 0,
  max = 255,
  value = 0,
  type,
}): JSX.Element => {
  const [currentValue, setValue] = useState(value);

  const changeValue = (event: Event) => {
    setValue(event.target instanceof HTMLInputElement ? Number(event.target.value) : 0);
  };

  return (
    <section className={style.section}>
      <input
        className={style.input}
        type="range"
        min={min}
        max={max}
        value={currentValue}
        onInput={changeValue}
      />
      <progress
        className={[style.progress, type && style[type]].join(' ')}
        min={min}
        max={max}
        value={currentValue}
      />
    </section>
  );
};

export default Slider;
