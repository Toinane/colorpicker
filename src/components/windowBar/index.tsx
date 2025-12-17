import { FunctionComponent, JSX } from 'react'

import AppIcons from './appIcons'
import WindowControls from './windowControls'

import style from './windowBar.module.css'

const WindowBar: FunctionComponent = (): JSX.Element => {
  return (
    <section className={style.windowBar} data-tauri-drag-region>
      <AppIcons />
      <div className={style.spacer} />
      <WindowControls />
    </section>
  )
}

export default WindowBar
