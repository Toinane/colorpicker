'use strict'

module.exports = (dirname, storage) => ({
  colorpicker: require('./colorpicker')(dirname, storage),
  colorsbook: require('./colorsbook')(dirname, storage),
  picker: require('./picker')(dirname, storage),
  support: require('./support')(dirname, storage),
  about: require('./about')(dirname, storage),
  settings: require('./settings')(dirname, storage)
})
