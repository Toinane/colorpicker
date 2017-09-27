'use strict'

const {TouchBar} = require('electron')
const {TouchBarColorPicker} = TouchBar;

module.exports = (eventEmitter, storage) => {
  let colorpicker = new TouchBarColorPicker({
    change: color => eventEmitter.emit('changeColor', color)
  })

  let touchbar = new TouchBar([colorpicker])

  let get = () => touchbar

  return touchbar
}
