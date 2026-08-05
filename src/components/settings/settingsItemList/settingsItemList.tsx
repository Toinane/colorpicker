import React from 'react'

import { Text } from '@components/ui'

import style from './settingsItemList.module.css'

type ListItem = string | Record<string, string>

export interface SettingsItemListProps {
  items: ListItem[]
}

const SettingsItemList = ({ items }: SettingsItemListProps) => {
  return (
    <section className={style.settingsItemList}>
      {items.map((item) => {
        if (typeof item === 'string') {
          return (
            <React.Fragment key={item}>
              <Text className={style.settingsItemListValue}>{item}</Text>
              <span className={style.settingsItemListEmpty}></span>
            </React.Fragment>
          )
        } else {
          return Object.entries(item).map(([key, value]) => (
            <React.Fragment key={key}>
              <Text className={style.settingsItemListLabel}>{key}</Text>
              <Text className={style.settingsItemListValue}>{value}</Text>
            </React.Fragment>
          ))
        }
      })}
    </section>
  )
}

export default SettingsItemList
