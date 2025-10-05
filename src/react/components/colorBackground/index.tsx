import { useEffect, useState, JSX, FunctionComponent } from 'react'

// import { colorState } from '@stores/color';

import style from './style.module.css'

const ColorBackground: FunctionComponent = (): JSX.Element => {
  const [color, setColor] = useState([0.2, 0.5, 0.8])

  useEffect(() => {
    const [red, green, blue] = color

    document.documentElement.style.setProperty(
      '--colopicker-main-color',
      `rgb(${red * 255},${green * 255},${blue * 255})`,
    )
  }, [color])

  return <section className={style.colorBackground} />
}

export default ColorBackground
