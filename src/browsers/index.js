'use strict';

module.exports = (dirname, storage) => ({
  colorpicker: require('./colorpicker')(dirname, storage),
  hexacolor: require('./hexacolor'),
  picker: require('./picker')
});
