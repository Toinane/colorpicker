'use strict';

const {app} = require('electron');
const path = require('path');

const {colorpicker, hexacolor, picker} = require('./browsers');

let tray;

app.on('ready', () => {
  colorpicker.init(__dirname);
  // picker.init(__dirname);
});

app.on('activate', () => {
    colorpicker.init(__dirname);
});

app.on('window-all-closed', function(){
  if(process.platform !== 'darwin') {
    app.quit();
  }
});
