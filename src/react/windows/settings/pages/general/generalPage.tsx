import { memo } from 'react'

import ColorpickerSettings from './colorpicker/colorpickerSettings'
import AdvancedSettings from './advanced/advancedSettings'
import AboutSettings from './about/aboutSettings'

const GeneralPage = () => {
  return (
    <>
      <ColorpickerSettings />
      <AdvancedSettings />
      <AboutSettings />
    </>
  )
}

export default memo(GeneralPage)
