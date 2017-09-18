'use strict'

const {TouchBar} = require('electron')
const {TouchBarLabel, TouchBarButton, TouchBarPopover, TouchBarColorPicker, TouchBarGroup, TouchBarScrubber, TouchBarSegmentedControl, TouchBarSlider, TouchBarSpacer} = TouchBar;

module.exports = eventEmitter => {
  let colorpicker = new TouchBarColorPicker({
    change: color => {
      eventEmitter.emit('changeColor', color)
      //console.log(color)
    }
  })

  let history = [
    new TouchBarButton({backgroundColor: '#00AEEF'}),
    new TouchBarButton({backgroundColor: '#10bEFF'})
  ]

  let touchbar = new TouchBar([colorpicker, new TouchBarSlider(), new TouchBarGroup({
    items: history
  })])

  let get = () => touchbar

  let updateHistory = () => {

  }

  return touchbar
}
