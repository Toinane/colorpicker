import { FunctionComponent, JSX } from 'react'

import { useControlledValue } from '@hooks/index'

import style from './numberInput.module.css'

type NumberInputProps = {
  min: number
  max: number
  maxLength?: number
  step?: number
  value: number
  onChange?: (value: number) => void
  /** Accessible name (e.g. "Red") — this input has no visible text label. */
  label: string
}

const NumberInput: FunctionComponent<NumberInputProps> = ({
  min,
  max,
  maxLength = 3,
  step = 1,
  value,
  onChange,
  label,
}): JSX.Element => {
  const [number, setNumber] = useControlledValue(Number.isNaN(value) ? 0 : value)

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
    if (event.code === 'ArrowUp') {
      setNumber(verifyNumber(number + step))
      onChange?.(verifyNumber(number + step))
    }
    if (event.code === 'ArrowDown') {
      setNumber(verifyNumber(number - step))
      onChange?.(verifyNumber(number - step))
    }
  }

  return (
    <input
      className={style.numberInput}
      type="input"
      min={min}
      max={max}
      maxLength={maxLength}
      step={step}
      value={number}
      aria-label={label}
      onFocus={(e) => e.target.select()}
      onInput={onInput}
      onKeyDown={onKeyboard}
      placeholder={number.toString()}
    />
  )
}

export default NumberInput
