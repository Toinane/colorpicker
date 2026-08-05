import { Heading, Text } from '@components/ui'

import style from './settingsItem.module.css'

export interface SettingsItemProps {
  label: string
  description?: string
  disabled?: boolean
  children?: React.ReactNode
}

const SettingsItem = ({ label, description, disabled = false, children }: SettingsItemProps) => {
  return (
    <section className={`${style.settingsItem} ${disabled ? style.settingsItemDisabled : ''}`}>
      <div className={style.settingsItemInfo}>
        <Heading level={3} className={style.settingsItemLabel}>
          {label}
        </Heading>
        {description && (
          <Text size="small" className={style.settingsItemDescription}>
            {description}
          </Text>
        )}
      </div>
      {/* `inert` blocks all interaction (click, keyboard, focus) regardless of
          what kind of control is passed as children, so callers don't also
          need to remember to thread a `disabled` prop into it themselves. */}
      <div className={style.settingsItemControl} inert={disabled || undefined}>
        {children}
      </div>
    </section>
  )
}

export default SettingsItem
