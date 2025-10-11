import i18n from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { initReactI18next } from 'react-i18next'

i18n
  .use(resourcesToBackend((lng: string, ns: string) => import(`@assets/locales/${lng}/${ns}.json`)))
  .use(initReactI18next)
  .init({
    lng: 'en_US',
    fallbackLng: 'en_US',
  })

export default i18n
