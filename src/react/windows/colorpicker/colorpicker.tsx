import { useEffect } from 'react'
import classNames from 'classnames'

import WindowBar from '@components/windowBar'
import RGBSlider from '@components/colorpicker/sliders/RGBSlider/RGBSlider'
import HexInput from '@components/colorpicker/inputs/hexInput'

import { useColorpickerStore } from '@react/stores/colorpickerStore'
import { useColorStore } from '../../stores/colorStore'

import './colorpicker.css'

const Colorpicker = () => {
  const { color, oppositeColor, isDarkColor } = useColorStore((state) => state)
  const { isBordered, isFullColored, isVibrant } = useColorpickerStore((state) => state)

  useEffect(() => {
    const rgb = color.to('srgb')

    document.documentElement.style.setProperty('--main-color', `${color}`)
    document.documentElement.style.setProperty('--main-color-r', `${Math.round(rgb.r * 100)}%`)
    document.documentElement.style.setProperty('--main-color-g', `${Math.round(rgb.g * 100)}%`)
    document.documentElement.style.setProperty('--main-color-b', `${Math.round(rgb.b * 100)}%`)
    document.documentElement.style.setProperty('--opposite-color', `${oppositeColor}`)
  }, [color, oppositeColor])

  const colorpickerClass = classNames('colorpicker', {
    DARK: isDarkColor,
    BORDERED: isBordered,
    COLORED: !isFullColored,
    VIBRANT: isVibrant,
  })

  return (
    <section className={colorpickerClass}>
      <WindowBar />
      <section className="sliders">
        <RGBSlider />
        <HexInput />
      </section>
    </section>
  )
}

export default Colorpicker
