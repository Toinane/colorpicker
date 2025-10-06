import { FunctionComponent, JSX, useState, useEffect } from 'react'

import style from './numberInput.module.css'

type NumberInputProps = {
  min: number
  max: number
  maxLength?: number
  step?: number
  value: number
  onChange?: (value: number) => void
}

const NumberInput: FunctionComponent<NumberInputProps> = ({
  min,
  max,
  maxLength = 3,
  step = 1,
  value,
  onChange,
}): JSX.Element => {
  const [number, setNumber] = useState(Number.isNaN(value) ? 0 : value)

  useEffect(() => {
    setNumber(Number.isNaN(value) ? 0 : value)
  }, [value])

  const verifyNumber = (currentNumber: number): number => {
    if (currentNumber < min) return min
    if (currentNumber > max) return max
    return currentNumber
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
    onChange?.(verifyNumber(currentNumber))
  }

  const onKeyboard = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.code === 'ArrowUp') setNumber(verifyNumber(number + step))
    if (event.code === 'ArrowDown') setNumber(verifyNumber(number - step))
  }

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
  )
}

export default NumberInput
