'use strict';

const {ipcMain, BrowserWindow} = require('electron');

module.exports = storage => {

  ipcMain.on('init-colorpicker', event => {
    const color = storage.get('lastColor');
    const posButton = storage.get('buttonsPosition');
    const typeButton = storage.get('buttonsType');
    event.sender.send('lastColor', color);
    event.sender.send('buttonsPosition', posButton);
    event.sender.send('buttonsType', typeButton);
  });

  ipcMain.on('changeLastColor', (event, color) => {
    storage.add({'lastColor': color});
  });

  ipcMain.on('setOnTop', (event, bool) => BrowserWindow.fromWebContents(event.sender).setAlwaysOnTop(bool));

};
