import { FunctionComponent, JSX, useState } from 'react'
// import { useRecoilValue } from 'recoil';
// import { formatHex } from 'culori';

// import { colorState } from '@stores/color';

import style from './style.module.css'

const HexInput: FunctionComponent = (): JSX.Element => {
  const [r, g] = useState([0, 0, 0])

  // const hex = formatHex({ mode: 'rgb', r, g, b })?.toUpperCase();

  const onInput = (event: React.FormEvent<HTMLInputElement>) => {
    if (!(event.target instanceof HTMLInputElement)) return
    const hexValue = event.target.value
    console.log(hexValue)
  }

  return (
    <input
      className={style.input}
      type="input"
      maxLength={7}
      value={r.toString()}
      onInput={onInput}
    />
  )
}

export default HexInput
