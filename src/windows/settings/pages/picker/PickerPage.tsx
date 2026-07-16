import { memo } from 'react'

import DisplaySettings from './display/displaySettings'
import BehaviorSettings from './behavior/behaviorSettings'

const PickerPage = () => {
  return (
    <>
      <DisplaySettings />
      <BehaviorSettings />
    </>
  )
}

export default memo(PickerPage)
