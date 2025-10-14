import { FunctionComponent, JSX } from 'react'

import AppIcons from './appIcons'

import style from './windowBar.module.css'

const WindowBar: FunctionComponent = (): JSX.Element => {
  return (
    <section className={style.windowBar}>
      <AppIcons />
      <section className={style.windowButtons}>
        <div className={style.menu} />
      </section>
    </section>
  )
}

export default WindowBar
