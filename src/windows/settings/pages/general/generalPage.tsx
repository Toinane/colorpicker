import { memo } from 'react'

import ColorpickerSettings from './colorpicker/colorpickerSettings'
import LanguageSettings from './language/languageSettings'
import AdvancedSettings from './advanced/advancedSettings'
import AboutSettings from './about/aboutSettings'

const GeneralPage = () => {
  return (
    <>
      <ColorpickerSettings />
      <LanguageSettings />
      <AdvancedSettings />
      <AboutSettings />
    </>
  )
}

export default memo(GeneralPage)
