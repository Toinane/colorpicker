'use strict'

const {TouchBar} = require('electron')
const {TouchBarLabel, TouchBarButton, TouchBarPopover, TouchBarColorPicker} = TouchBar;

let colorpicker = new TouchBarColorPicker({
  change: color => {
    console.log(color)
  }
})

let history = [
  new TouchBarButton({backgroundColor: '#00AEEF'})
]

let touchbar = new TouchBar([colorpicker, ...history])

let get = () => touchbar

let updateHistory = () => {

}

module.exports = {
  get: get,
  updateHistory: updateHistory
}
