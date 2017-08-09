'use strict'

module.exports = (storage, browsers) => ({
  colorpicker: require('./colorpicker')(storage, browsers),
  colorsbook: require('./colorsbook')(storage, browsers),
  picker: require('./picker')(storage, browsers),
  about: require('./about')(storage, browsers),
  settings: require('./settings')(storage, browsers)
})
