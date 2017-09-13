'use strict'

const {TouchBar} = require('electron')
const {TouchBarLabel, TouchBarButton, TouchBarSpacer} = TouchBar;

let touchbar

let test = new TouchBarLabel({
  label: 'Colorpicker'
})

let test2 = new TouchBarButton({
  label: 'Test',
  click: () => {
    console.log('test ici')
  }
})

touchbar = new TouchBar([test, test2])

let get = () => touchbar

module.exports = {
  get: get
}
