'use strict'

const {TouchBar} = require('electron')
const {TouchBarLabel, TouchBarButton, TouchBarPopover, TouchBarColorPicker} = TouchBar;

module.exports = eventEmitter => {
  let colorpicker = new TouchBarColorPicker({
    change: color => {
      eventEmitter.emit('changeColor', color)
      //console.log(color)
    }
  })

  let history = [
    new TouchBarButton({backgroundColor: '#00AEEF'})
  ]

  let touchbar = new TouchBar([colorpicker, ...history])

  let get = () => touchbar

  let updateHistory = () => {

  }

  return touchbar
}
