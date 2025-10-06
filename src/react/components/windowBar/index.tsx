import { FunctionComponent, JSX, useState } from 'react'

import AppIcons from './appIcons'

import style from './style.module.css'

const WindowBar: FunctionComponent = (): JSX.Element => {
  const [lock, setLock] = useState(false)

  const LockIcon = lock ? (
    <svg viewBox="0 0 256 256">
      <path
        fill="var(--app-icon-main-color)"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M84.9746 79.3481C84.9746 63.8465 90.5058 52.7398 98.3648 45.471C106.324 38.1097 117.075 34.3162 128 34.3162C138.925 34.3162 149.676 38.1097 157.635 45.471C165.494 52.7399 171.025 63.8465 171.025 79.3481V110.624H84.9746V79.3481ZM71.9746 110.624V79.3481C71.9746 60.4951 78.8247 45.8358 89.5378 35.9273C100.151 26.1113 114.162 21.3162 128 21.3162C141.838 21.3162 155.849 26.1113 166.462 35.9273C177.175 45.8358 184.025 60.4951 184.025 79.3481V110.624H203.069H216.069V123.624V229.679V242.679H203.069H52.9309H39.9309V229.679V123.624V110.624H52.9309H71.9746ZM52.9309 123.624H203.069V229.679H52.9309V123.624Z"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 256 256">
      <path
        fill="var(--app-icon-main-color)"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M98.3596 38.658C110.314 26.4243 128.447 23.2454 143.623 29.3086C158.433 35.2257 171.025 50.274 171.025 76.0211V110.624H52.9309H39.9309V123.624V229.679V242.679H52.9309H203.069H216.069V229.679V123.624V110.624H203.069H184.025V76.0211C184.025 45.4054 168.599 25.2879 148.446 17.2364C128.658 9.33086 104.884 13.3804 89.0617 29.5724L98.3596 38.658ZM52.9309 123.624H203.069V229.679H52.9309V123.624Z"
      />
    </svg>
  )

  return (
    <section className={style.windowBar}>
      <AppIcons />
      <section className={style.windowButtons}>
        {/* <div className={style.menu} />
        <div
          className={lock ? style.lock : style.unlock}
          role="button"
          tabIndex={-1}
          onClick={() => setLock(!lock)}
          onKeyUp={() => setLock(!lock)}
        >
          {LockIcon}
        </div>
        <div
          className={style.minimize}
          role="button"
          tabIndex={-1}
          onClick={window.api.window.minimize}
          onKeyUp={window.api.window.minimize}
        />
        <div
          className={style.maximize}
          role="button"
          tabIndex={-1}
          onClick={window.api.window.maximize.toggle}
          onKeyUp={window.api.window.maximize.toggle}
        />
        <div
          className={style.close}
          role="button"
          tabIndex={-1}
          onClick={window.api.window.close}
          onKeyUp={window.api.window.close}
        /> */}
      </section>
    </section>
  )
}

export default WindowBar
