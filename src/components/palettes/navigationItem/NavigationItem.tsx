import classNames from 'clsx'

import { Text } from '@components/ui'

import style from './navigationItem.module.css'

const NavigationItem = ({
  label,
  color,
  isActive,
}: {
  label: string
  color: string
  isActive?: boolean
}) => {
  return (
    <button className={classNames(style.navigationItem, isActive && style.active)}>
      <div className={style.colorSwatch} style={{ backgroundColor: color }}></div>
      <Text color="primary" className={style.label}>
        {label}
      </Text>
    </button>
  )
}

export default NavigationItem
