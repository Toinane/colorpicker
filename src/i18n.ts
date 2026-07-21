import i18n, { type BackendModule } from 'i18next'
import { initReactI18next } from 'react-i18next'

const resourcesBackend: BackendModule = {
  type: 'backend',
  init: () => {},
  read: (language, namespace, callback) => {
    import(`@assets/locales/${language}/${namespace}.json`)
      .then((module) => callback(null, module.default))
      .catch((error) => callback(error, null))
  },
}

i18n.use(resourcesBackend).use(initReactI18next).init({
  lng: 'en_US',
  fallbackLng: 'en_US',
})

export default i18n
