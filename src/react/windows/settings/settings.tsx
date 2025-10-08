import { useTranslation } from 'react-i18next'

import './settings.css'

const Settings = () => {
  const { t } = useTranslation()

  return (
    <section className="settings">
      <h1>{t('common.settings')}</h1>
    </section>
  )
}

export default Settings
