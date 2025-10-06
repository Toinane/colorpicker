import { useEffect, JSX, FunctionComponent } from 'react'

import { useColorStore } from '../../stores/color'

import style from './style.module.css'

const ColorBackground: FunctionComponent = (): JSX.Element => {
  const color = useColorStore((state) => state.color)

  useEffect(() => {
    document.documentElement.style.setProperty('--colorpicker-main-color', `${color}`)
  }, [color])

  return <section className={style.colorBackground} />
}

export default ColorBackground
