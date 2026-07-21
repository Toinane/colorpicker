import { JSX, FunctionComponent } from 'react'

import style from './colorBackground.module.css'

const ColorBackground: FunctionComponent = (): JSX.Element => {
  return <section className={style.colorBackground} />
}

export default ColorBackground
