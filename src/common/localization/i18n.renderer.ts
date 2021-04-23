import path from 'path'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import i18nBackend from 'i18next-electron-fs-backend'

import { isMacos, isDev } from '../utils/platform'

const prependPath: string = isMacos && !isDev ? path.join(process.resourcesPath, '..') : '.'

i18n.use(i18nBackend)
    .use(initReactI18next)
    .init({
        backend: {
            loadPath: `${prependPath}/src/common/localization/locales/{{lng}}/{{ns}}.json`,
            addPath: `${prependPath}/src/common/localization/locales/{{lng}}/{{ns}}.missing.json`,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ipcRenderer: window.i18nextElectronBackend,
        },
        debug: isDev,
        saveMissing: true,
        saveMissingTo: 'all',
        lng: 'en',
        fallbackLng: 'en',
    })

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.i18nextElectronBackend.onLanguageChange((args: { lng: string }) => {
    i18n.changeLanguage(args.lng, (error) => {
        if (error) {
            console.error(error)
        }
    })
})

export default i18n
