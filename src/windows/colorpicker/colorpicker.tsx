import { useEffect } from 'react'
import classNames from 'classnames'
import { listen } from '@tauri-apps/api/event'

import WindowBar from '@components/windowBar'
import RGBSlider from '@components/colorpicker/sliders/RGBSlider/RGBSlider'
import HexInput from '@components/colorpicker/inputs/hexInput'

import { useColorpickerStore } from '@stores/colorpickerStore'
import { useColorStore } from '@stores/colorStore'
import { rgbToColor, type RGBColor } from '@common/color'

import './colorpicker.css'

const Colorpicker = () => {
  const { color, oppositeColor, isDarkColor, setColor } = useColorStore((state) => state)
  const { isBordered, isFullColored, isVibrant } = useColorpickerStore((state) => state)

  useEffect(() => {
    // Color picked via the global hotkey (no invoke() caller to resolve to)
    const unlistenPromise = listen<RGBColor | null>('color-picked', (event) => {
      if (event.payload) {
        setColor(rgbToColor(event.payload))
      }
    })

    return () => {
      unlistenPromise.then((unlisten) => unlisten())
    }
  }, [setColor])

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
