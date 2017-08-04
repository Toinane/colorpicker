'use strict';

const {ipcMain, BrowserWindow, app} = require('electron');

let timing;

module.exports = storage => {

  ipcMain.on('init-colorpicker', event => {
    let config = {};
    config.color = storage.get('lastColor').length ? storage.get('lastColor') : '#00AEEF';
    config.posButton = storage.get('buttonsPosition');
    config.typeButton = storage.get('buttonsType');

    event.sender.send('init', config);
  });

  ipcMain.on('changeLastColor', (event, color) => {
    clearTimeout(timing);
    timing = setTimeout(() => storage.add({'lastColor': color}), 300);
  });

  ipcMain.on('opacityActive', (event, bool) => {
    let win = BrowserWindow.fromWebContents(event.sender);
    let size = win.getSize();
    if(!bool) return win.setMinimumSize(440, 150);
    if (size[1] < 180) win.setSize(size[0], 180, true);
    win.setMinimumSize(440, 180);
  });

  ipcMain.on('minimize', event => BrowserWindow.fromWebContents(event.sender).minimize());
  ipcMain.on('maximize', (event, bool) => {
    if (bool) return BrowserWindow.fromWebContents(event.sender).maximize()
    return BrowserWindow.fromWebContents(event.sender).unmaximize()
  });
  ipcMain.on('close', event => BrowserWindow.fromWebContents(event.sender).close());

  ipcMain.on('setOnTop', (event, bool) => BrowserWindow.fromWebContents(event.sender).setAlwaysOnTop(bool));

};
