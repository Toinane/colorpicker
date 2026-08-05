import { Fragment } from 'react'
import classNames from 'clsx'

import { Text } from '@components/ui'
import { formatKeyPart } from './keySymbols'

import style from './KeyCombo.module.css'

export type KeyComboType = 'separated' | 'joined'
export type KeyComboVariant = 'filled' | 'outlined' | 'transparent'

export interface KeyComboProps {
  /** Raw accelerator parts, e.g. `['CommandOrControl', 'Shift', 'K']` */
  keys: string[]
  /** `separated` shows a "+" between keys, `joined` shows them with no separator */
  type?: KeyComboType
  variant?: KeyComboVariant
}

const VARIANT_CLASS: Record<KeyComboVariant, string> = {
  filled: style.keyComboKeyFilled,
  outlined: style.keyComboKeyOutlined,
  transparent: style.keyComboKeyTransparent,
}

const KeyCombo = ({ keys, type = 'joined', variant = 'filled' }: KeyComboProps) => {
  return (
    <span className={style.keyComboGroup}>
      {keys.map((part, i) => (
        <Fragment key={part}>
          {type === 'separated' && i > 0 && (
            <Text color="accent" size="small">
              +
            </Text>
          )}
          <Text
            size="small"
            weight="bold"
            className={classNames(style.keyComboKey, VARIANT_CLASS[variant])}
          >
            {formatKeyPart(part)}
          </Text>
        </Fragment>
      ))}
    </span>
  )
}

export default KeyCombo
