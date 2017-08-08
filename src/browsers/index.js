'use strict'

module.exports = (dirname, storage) => ({
  colorpicker: require('./colorpicker')(dirname, storage),
  hexacolor: require('./hexacolor')(dirname, storage),
  picker: require('./picker')(dirname, storage),
  about: require('./about')(dirname, storage),
  settings: require('./settings')(dirname, storage)
})
