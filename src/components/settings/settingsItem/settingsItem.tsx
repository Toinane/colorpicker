import style from './settingsItem.module.css'

export interface SettingsItemProps {
  label: string
  description?: string
  children?: React.ReactNode
}

const SettingsItem = ({ label, description, children }: SettingsItemProps) => {
  return (
    <section className={style.settingsItem}>
      <div className={style.settingsItemInfo}>
        <h3 className={style.settingsItemLabel}>{label}</h3>
        {description && <div className={style.settingsItemDescription}>{description}</div>}
      </div>
      {children}
    </section>
  )
}

export default SettingsItem
