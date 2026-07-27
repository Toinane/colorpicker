import { useEffect } from 'react'
import classNames from 'clsx'
import { writeText } from '@tauri-apps/plugin-clipboard-manager'
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification'
import { useTranslation } from 'react-i18next'

import WindowBar from '@components/windowBar'
import RGBSlider from '@components/colorpicker/sliders/RGBSlider/RGBSlider'
import HexInput from '@components/colorpicker/inputs/hexInput'

import { useColorpickerStore } from '@stores/colorpickerStore'
import { useColorStore } from '@stores/colorStore'
import { useSettingsStore } from '@stores/settingsStore'
import { usePickerHistoryStore } from '@stores/pickerHistoryStore'
import { showToast } from '@stores/toastStore'
import { rgbToColor, serializeColor, toHex } from '@common/color'
import { onColorPicked } from '@common/ipc'

import './colorpicker.css'

const notifyColorPicked = async (title: string, text: string): Promise<void> => {
  let granted = await isPermissionGranted()
  if (!granted) {
    granted = (await requestPermission()) === 'granted'
  }
  if (granted) {
    sendNotification({ title, body: text })
  }
}

const Colorpicker = () => {
  const CommonT = useTranslation('common')
  const { color, oppositeColor, isDarkColor, setColor } = useColorStore((state) => state)
  const { isBordered, isFullColored, isVibrant } = useColorpickerStore((state) => state)

  useEffect(() => {
    // Color picked via any of the three trigger paths (toolbar/tray/hotkey)
    // — this is the single result path (see src/common/ipc.ts). A
    // multi-pick session (Shift+Click, see B8) fires this once per pick,
    // not just at the end. Rust stays format-agnostic (only r/g/b, no
    // colorjs.io) — auto-copy formatting happens here so hex/rgb/hsl/hsv
    // (and later, user-defined templates) only ever need to be implemented
    // once, in the frontend.
    const unlistenPromise = onColorPicked((rgb) => {
      if (!rgb) return

      const pickedColor = rgbToColor(rgb)
      setColor(pickedColor)

      // Picker history is its own independent log — separate from manual
      // RGB slider/hex edits (see @stores/colorHistoryStore) — and commits
      // immediately since a pick (even a multi-pick) is already a discrete,
      // deliberate action, not something to debounce.
      usePickerHistoryStore.getState().commitColor(toHex(pickedColor))

      const { autoCopyOnPick, quickPickHeadless, defaultFormat, hexPrefix } =
        useSettingsStore.getState()

      // Headless quick-pick always copies (that's the point of never
      // showing the window) and additionally shows a notification with the
      // value, since there's no window to glance at.
      if (quickPickHeadless) {
        const text = serializeColor(pickedColor, defaultFormat, { hexPrefix })
        writeText(text)
          .then(() => notifyColorPicked(CommonT.t('notification.colorPickedTitle'), text))
          .catch((err) => console.error('Failed headless copy/notify for picked color:', err))
      } else if (autoCopyOnPick) {
        const text = serializeColor(pickedColor, defaultFormat, { hexPrefix })
        writeText(text)
          .then(() => showToast(CommonT.t('action.colorCopiedToast')))
          .catch((err) => console.error('Failed to auto-copy picked color:', err))
      }
    })

    return () => {
      unlistenPromise.then((unlisten) => unlisten())
    }
  }, [setColor, CommonT])

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
