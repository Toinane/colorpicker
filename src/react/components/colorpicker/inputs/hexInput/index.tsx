import { FunctionComponent, JSX, useCallback, useState, useEffect } from 'react'
import Color from 'colorjs.io'

import { useColorStore } from '@react/stores/colorStore'
import { isValidHex } from '@common/color'

import './hexInput.css'

const HexInput: FunctionComponent = (): JSX.Element => {
  const { color, setColor } = useColorStore((state) => state)
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

  const onKeyboard = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!(event.target instanceof HTMLInputElement)) return

    if (event.code === 'ArrowUp') {
      const newColor = new Color(event.target.value).to('srgb').set({
        r: (r) => (r < 1 ? r + 0.01 : r),
        g: (g) => (g < 1 ? g + 0.01 : g),
        b: (b) => (b < 1 ? b + 0.01 : b),
      })

      setColor(newColor)
      setInputValue(newColor.toString({ format: 'hex' }))
    }
    if (event.code === 'ArrowDown') {
      const newColor = new Color(event.target.value).to('srgb').set({
        r: (r) => (r > 0 ? r - 0.01 : r),
        g: (g) => (g > 0 ? g - 0.01 : g),
        b: (b) => (b > 0 ? b - 0.01 : b),
      })

      setColor(newColor)
      setInputValue(newColor.toString({ format: 'hex' }))
    }
  }

  return (
    <input
      className="hexInput"
      type="text"
      maxLength={7}
      value={inputValue}
      onInput={onInput}
      onKeyDown={onKeyboard}
      onFocus={(e) => e.target.select()}
      placeholder={color.toString({ format: 'hex' })}
    />
  )
}

export default HexInput
