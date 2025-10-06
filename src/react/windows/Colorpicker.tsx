import { useEffect } from 'react'

import WindowBar from '@components/windowBar'
import RGBSlider from '@components/sliders/RGBSlider'
import HexInput from '@components/sliders/hexInput'

import { useColorStore } from '../stores/color'

import style from './colorpicker.module.css'

const Colorpicker = () => {
  const color = useColorStore((state) => state.color)

  useEffect(() => {
    document.documentElement.style.setProperty('--colorpicker-main-color', `${color}`)
  }, [color])

  return (
    <>
      <WindowBar />
      <section className={style.sliders}>
        <RGBSlider />
        <HexInput />
      </section>
    </>
  )
}

export default Colorpicker
