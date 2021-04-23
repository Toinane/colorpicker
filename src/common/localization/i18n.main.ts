import path from 'path'
import i18n from 'i18next'
import Backend from 'i18next-fs-backend'

import { isMacos, isDev } from '../utils/platform'

const prependPath: string = isMacos && !isDev ? path.join(process.resourcesPath, '..') : '.'

i18n.use(Backend).init({
    backend: {
        loadPath: `${prependPath}/src/common/localization/locales/{{lng}}/{{ns}}.json`,
        addPath: `${prependPath}/src/common/localization/locales/{{lng}}/{{ns}}.missing.json`,
    },
    debug: isDev,
    saveMissing: true,
    saveMissingTo: 'all',
    lng: 'en',
})

export default i18n
