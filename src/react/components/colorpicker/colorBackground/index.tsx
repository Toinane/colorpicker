import { JSX, FunctionComponent } from 'react'

import { useColorStore } from '@react/stores/colorStore'

import style from './colorBackground.module.css'

const ColorBackground: FunctionComponent = (): JSX.Element => {
  const color = useColorStore((state) => state.color)
  return <section className={style.colorBackground} />
}

export default ColorBackground
