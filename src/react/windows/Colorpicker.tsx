import { useCallback, useEffect, useState } from 'react'

import debounce from '@common/debounce'

import WindowBar from '@components/windowBar'
import ColorBackground from '@components/colorBackground'
import RGBSlider from '@components/sliders/RGBSlider'
import HexInput from '@components/sliders/hexInput'

import { useColorStore } from '../stores/color'

// import { useColorStore } from '../stores/color'

const Colorpicker = () => {
  const color = useColorStore((state) => state.color)

  useEffect(() => {
    document.documentElement.style.setProperty('--colorpicker-main-color', `${color}`)
  }, [color])

  // const saveColor = useCallback(
  //   debounce((red: number, green: number, blue: number) => {
  //     window.api.colorpicker.store.update({
  //       currentColor: {
  //         r: red,
  //         g: green,
  //         b: blue,
  //       },
  //     })
  //   }, 500),
  //  [],
  // )

  // useEffect(() => {
  // window.api.colorpicker.store
  //   .get()
  //   .then((store) => {
  //     const rgb = { r: 0, g: 0, b: 0 } //converter('rgb')(store.currentColor)
  //     if (!rgb) return
  //     setRed(rgb.r)
  //     setGreen(rgb.g)
  //     setBlue(rgb.b)
  //   })
  //   .catch((e) => console.log(e))
  // }, [setBlue, setGreen, setRed])

  // useEffect(() => {
  //   saveColor(r, g, b)
  // }, [r, g, b, saveColor])

  return (
    <>
      <WindowBar />
      {/* <ColorBackground /> */}
      <RGBSlider />
      {/* <HexInput /> */}
    </>
  )
}

export default Colorpicker
