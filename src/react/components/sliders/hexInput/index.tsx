import { FunctionComponent, JSX } from 'preact';
import { useRecoilValue } from 'recoil';
import { formatHex } from 'culori';

import { colorState } from '@stores/color';

import style from './style.module.css';

const HexInput: FunctionComponent = (): JSX.Element => {
  const [r, g, b] = useRecoilValue(colorState);

  const hex = formatHex({ mode: 'rgb', r, g, b })?.toUpperCase();

  const onInput = (event: Event) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    const hexValue = event.target.value;
    console.log(hexValue);
  };

  return <input className={style.input} type="input" maxLength={7} value={hex} onInput={onInput} />;
};

export default HexInput;
