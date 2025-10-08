import i18n from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { initReactI18next } from 'react-i18next'

i18n
  .use(resourcesToBackend((lng: string) => import(`@assets/locales/${lng}.json`)))
  .use(initReactI18next)
  .init({
    lng: 'en_US',
    fallbackLng: 'en_US',
  })

export default i18n
