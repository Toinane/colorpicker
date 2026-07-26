import { useEffect } from 'react'
import classNames from 'clsx'

import WindowBar from '@components/windowBar'
import RGBSlider from '@components/colorpicker/sliders/RGBSlider/RGBSlider'
import HexInput from '@components/colorpicker/inputs/hexInput'

import { useColorpickerStore } from '@stores/colorpickerStore'
import { useColorStore } from '@stores/colorStore'
import { rgbToColor } from '@common/color'
import { onColorPicked } from '@common/ipc'

import './colorpicker.css'

const Colorpicker = () => {
  const { color, oppositeColor, isDarkColor, setColor } = useColorStore((state) => state)
  const { isBordered, isFullColored, isVibrant } = useColorpickerStore((state) => state)

  useEffect(() => {
    // Color picked via any of the three trigger paths (toolbar/tray/hotkey)
    // — this is the single result path (see src/common/ipc.ts)
    const unlistenPromise = onColorPicked((color) => {
      if (color) {
        setColor(rgbToColor(color))
      }
    })

    return () => {
      unlistenPromise.then((unlisten) => unlisten())
    }
  }, [setColor])

  useEffect(() => {
    // These three appearance settings are consumed by legacy global CSS
    // (style.global.css's `body.bordered`, windowBar.module.css's
    // `colored`/`no-vibrancy`) that expects the classes on <body>, not on
    // this component's own root element.
    document.body.classList.toggle('bordered', isBordered)
    document.body.classList.toggle('colored', isFullColored)
    document.body.classList.toggle('no-vibrancy', !isVibrant)

    return () => {
      document.body.classList.remove('bordered', 'colored', 'no-vibrancy')
    }
  }, [isBordered, isFullColored, isVibrant])

  useEffect(() => {
    const rgb = color.to('srgb')

    document.documentElement.style.setProperty('--main-color', `${color}`)
    document.documentElement.style.setProperty(
      '--main-color-r',
      `${Math.round((rgb.r ?? 0) * 100)}%`,
    )
    document.documentElement.style.setProperty(
      '--main-color-g',
      `${Math.round((rgb.g ?? 0) * 100)}%`,
    )
    document.documentElement.style.setProperty(
      '--main-color-b',
      `${Math.round((rgb.b ?? 0) * 100)}%`,
    )
    document.documentElement.style.setProperty('--opposite-color', `${oppositeColor}`)
  }, [color, oppositeColor])

  const colorpickerClass = classNames('colorpicker', {
    DARK: isDarkColor,
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
