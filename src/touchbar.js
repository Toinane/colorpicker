'use strict'

const {TouchBar} = require('electron')
const {TouchBarLabel, TouchBarButton, TouchBarPopover, TouchBarColorPicker} = TouchBar;

let touchbar

let colorpicker = new TouchBarColorPicker({
  change: color => {
    console.log(color)
  }
})

touchbar = new TouchBar([colorpicker])

let get = () => touchbar

let updateHistory = () => {

}

module.exports = {
  get: get,
  updateHistory: updateHistory
}
