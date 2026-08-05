import { Heading } from '@components/ui'

import style from './settingsSection.module.css'

export interface SettingsSectionProps {
  children: React.ReactNode
  title?: string
}

const SettingsSection = ({ children, title }: SettingsSectionProps) => {
  return (
    <section className={style.settingsSection}>
      {title && (
        <Heading
          level={1}
          id={title}
          weight={'bold'}
          color={'primary'}
          className={style.settingsSectionTitle}
        >
          {title}
        </Heading>
      )}
      <div className={style.settingsSectionContent}>{children}</div>
    </section>
  )
}

export default SettingsSection
