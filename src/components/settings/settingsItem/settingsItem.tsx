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
        <h3 className={style.settingsItemLabel}>{label}</h3>
        {description && <div className={style.settingsItemDescription}>{description}</div>}
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
