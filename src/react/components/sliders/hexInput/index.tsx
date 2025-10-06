import { FunctionComponent, JSX, useCallback, useState, useEffect } from 'react'
import Color from 'colorjs.io'

import { useColorStore } from '@react/stores/color'
import { isValidHex } from '@common/color'

import style from './hexInput.module.css'

const HexInput: FunctionComponent = (): JSX.Element => {
  const color = useColorStore((state) => state.color)
  const setColor = useColorStore((state) => state.setColor)

  const [inputValue, setInputValue] = useState(color.toString({ format: 'hex' }))

  useEffect(() => {
    setInputValue(color.toString({ format: 'hex' }))
  }, [color])

  const onInput = useCallback(
    (event: React.FormEvent<HTMLInputElement>) => {
      if (!(event.target instanceof HTMLInputElement)) return
      const value = event.target.value
      setInputValue(value)

      if (isValidHex(value)) {
        setColor(new Color(value))
      }
    },
    [setColor],
  )

  return (
    <input
      className={style.input}
      type="text"
      maxLength={7}
      value={inputValue.toUpperCase()}
      onInput={onInput}
      placeholder="#3380CC"
    />
  )
}

export default HexInput
