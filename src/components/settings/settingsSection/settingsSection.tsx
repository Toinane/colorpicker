import style from './settingsSection.module.css'

export interface SettingsSectionProps {
  children: React.ReactNode
  title?: string
}

const SettingsSection = ({ children, title }: SettingsSectionProps) => {
  return (
    <section className={style.settingsSection}>
      {title && (
        <h1 className={style.settingsSectionTitle} id={title}>
          {title}
        </h1>
      )}
      <div className={style.settingsSectionContent}>{children}</div>
    </section>
  )
}

export default SettingsSection
