'use strict';

const {app, Tray} = require('electron');
const settings = require('./settings');
const {colorpicker, hexacolor, picker} = require('./browsers');

let tray;

settings.init('colorpicker');

let createTray = () => {
	if (tray) return;
	tray = new Tray(`${__dirname}/ressources/tray-black@3x.png`);
  tray.setPressedImage(`${__dirname}/ressources/tray-white@3x.png`);
  tray.on('click', event => colorpicker.init(__dirname));
}

app.on('ready', () => {
  createTray();
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
