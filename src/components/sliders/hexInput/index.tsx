import { FunctionComponent, JSX } from 'preact';
import { formatHex } from 'culori';

import style from './style.module.css';

const HexInput: FunctionComponent = (): JSX.Element => {
  const hex = formatHex({ mode: 'rgb', r: r / 255, g: g / 255, b: b / 255 })?.toUpperCase();

  const onInput = (event: Event) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    const hexValue = event.target.value;
    console.log(hexValue);
  };

  return <input className={style.input} type="input" maxLength={7} value={hex} onInput={onInput} />;
};

export default HexInput;
