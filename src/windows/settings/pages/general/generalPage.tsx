import { memo } from 'react'

import ColorpickerSettings from './colorpicker/colorpickerSettings'
import LanguageSettings from './language/languageSettings'
import AdvancedSettings from './advanced/advancedSettings'
import AboutSettings from './about/aboutSettings'
import ExperimentalSettings from './experimental/experimentalSettings'

const GeneralPage = () => {
  return (
    <>
      <ColorpickerSettings />
      <LanguageSettings />
      <AdvancedSettings />
      <ExperimentalSettings />
      <AboutSettings />
    </>
  )
}

export default memo(GeneralPage)
