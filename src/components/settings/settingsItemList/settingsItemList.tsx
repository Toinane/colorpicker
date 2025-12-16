import React from 'react'
import style from './settingsItemList.module.css'

type ListItem = string | Record<string, string>

export interface SettingsItemListProps {
  items: ListItem[]
}

const SettingsItemList = ({ items }: SettingsItemListProps) => {
  return (
    <section className={style.settingsItemList}>
      {items.map((item, index) => {
        if (typeof item === 'string') {
          return (
            <React.Fragment key={`string-${index}`}>
              <span className={style.settingsItemListValue}>{item}</span>
              <span className={style.settingsItemListEmpty}></span>
            </React.Fragment>
          )
        } else {
          return Object.entries(item).map(([key, value]) => (
            <React.Fragment key={`${index}-${key}`}>
              <span className={style.settingsItemListLabel}>{key}</span>
              <span className={style.settingsItemListValue}>{value}</span>
            </React.Fragment>
          ))
        }
      })}
    </section>
  )
}

export default SettingsItemList
