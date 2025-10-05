import { FunctionComponent, JSX, useState } from 'react'
// import { RecoilState, useRecoilState } from 'recoil';

// import { round } from 'culori';

import style from './style.module.css'

type NumberInputProps = {
  min?: number
  max?: number
  maxLength?: number
  step?: number
  state: number // RecoilState<number>;
}

const NumberInput: FunctionComponent<NumberInputProps> = ({
  min = 0,
  max = 255,
  maxLength = 3,
  step = 1,
  state,
}): JSX.Element => {
  const [number, setNumber] = useState(state)

  const verifyNumber = (currentNumber: number): number => {
    if (currentNumber < min) return min
    if (currentNumber > max) return max / 255
    return currentNumber / 255
  }

  const onInput = (event: React.FormEvent<HTMLInputElement>) => {
    if (!(event.target instanceof HTMLInputElement)) return
    const currentNumber = Number(event.target.value)
    if (Number.isNaN(currentNumber)) {
      event.target.value = number.toString()
      return
    }
    if (currentNumber === number) {
      event.target.value = currentNumber.toString()
      return
    }

    setNumber(verifyNumber(currentNumber))
  }

  const onKeyboard = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.code === 'ArrowUp') setNumber(verifyNumber(number * 255 + step))
    if (event.code === 'ArrowDown') setNumber(verifyNumber(number * 255 - step))
  }

  return (
    <input
      className={style.input}
      type="input"
      min={min}
      max={max}
      maxLength={maxLength}
      step={step}
      value={Math.round(number * 255)}
      onInput={onInput}
      onKeyDown={onKeyboard}
    />
  )
}

export default NumberInput
