import { FunctionComponent, JSX } from 'preact';
import { RecoilState, useRecoilState } from 'recoil';

import style from './style.module.css';

type NumberInputProps = {
  min?: number;
  max?: number;
  maxLength?: number;
  step?: number;
  state: RecoilState<number>;
};

const NumberInput: FunctionComponent<NumberInputProps> = ({
  min = 0,
  max = 255,
  maxLength = 3,
  step = 1,
  state,
}): JSX.Element => {
  const [number, setNumber] = useRecoilState(state);

  const verifyNumber = (currentNumber: number): number => {
    if (currentNumber < min) return min;
    if (currentNumber > max) return max;
    return currentNumber;
  };

  const onInput = (event: Event) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    const currentNumber = Number(event.target.value);
    if (Number.isNaN(currentNumber)) {
      // eslint-disable-next-line no-param-reassign
      event.target.value = number.toString();
      return;
    }
    if (currentNumber === number) {
      // eslint-disable-next-line no-param-reassign
      event.target.value = currentNumber.toString();
      return;
    }

    setNumber(verifyNumber(currentNumber));
  };

  const onKeyboard = (event: KeyboardEventInit) => {
    if (event.code === 'ArrowUp') setNumber(verifyNumber(number + step));
    if (event.code === 'ArrowDown') setNumber(verifyNumber(number - step));
  };

  return (
    <input
      className={style.input}
      type="input"
      min={min}
      max={max}
      maxLength={maxLength}
      step={step}
      value={number}
      onInput={onInput}
      onKeyDown={onKeyboard}
    />
  );
};

export default NumberInput;
