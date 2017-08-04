'use strict';

const {ipcMain, BrowserWindow, app} = require('electron');

let timing;

module.exports = storage => {

  ipcMain.on('init-colorpicker', event => {
    const color = storage.get('lastColor').length ? storage.get('lastColor') : '#00AEEF';
    const posButton = storage.get('buttonsPosition');
    const typeButton = storage.get('buttonsType');
    event.sender.send('lastColor', color);
    event.sender.send('buttonsPosition', posButton);
    event.sender.send('buttonsType', typeButton);
  });

  ipcMain.on('changeLastColor', (event, color) => {
    clearTimeout(timing);
    timing = setTimeout(() => storage.add({'lastColor': color}), 300);
  });

  ipcMain.on('minimize', event => BrowserWindow.fromWebContents(event.sender).minimize());
  ipcMain.on('maximize', (event, bool) => {
    if (bool) return BrowserWindow.fromWebContents(event.sender).maximize()
    return BrowserWindow.fromWebContents(event.sender).unmaximize()
  });
  ipcMain.on('close', event => BrowserWindow.fromWebContents(event.sender).close());

  ipcMain.on('setOnTop', (event, bool) => BrowserWindow.fromWebContents(event.sender).setAlwaysOnTop(bool));

};
