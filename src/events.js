'use strict';

const {ipcMain, BrowserWindow, app} = require('electron');

let timing, opacity, shading;

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
    opacity = bool;
    let win = BrowserWindow.fromWebContents(event.sender);
    let size = win.getSize();
    if(!opacity && shading) return win.setMinimumSize(440, 220);
    if(!opacity) return win.setMinimumSize(440, 150);
    if (size[1] < 180 && !shading) win.setSize(size[0], 180, true);
    if (size[1] < 255 && shading) win.setSize(size[0], 255, true);
    if(!shading) win.setMinimumSize(440, 180);
    else win.setMinimumSize(440, 255);
  });

  ipcMain.on('shadingActive', (event, bool) => {
    shading = bool;
    let win = BrowserWindow.fromWebContents(event.sender);
    let size = win.getSize();
    if(!shading && !opacity) return win.setMinimumSize(440, 150);
    if(!shading && opacity) return win.setMinimumSize(440, 180);
    if (size[1] < 220 && !opacity) win.setSize(size[0], 220, true);
    if (size[1] < 255 && opacity) win.setSize(size[0], 255, true);
    if (!opacity) win.setMinimumSize(440, 220);
    else win.setMinimumSize(440, 255);
  });

  ipcMain.on('minimize', event => BrowserWindow.fromWebContents(event.sender).minimize());
  ipcMain.on('maximize', (event, bool) => {
    if (bool) return BrowserWindow.fromWebContents(event.sender).maximize()
    return BrowserWindow.fromWebContents(event.sender).unmaximize()
  });
  ipcMain.on('close', event => BrowserWindow.fromWebContents(event.sender).close());

  ipcMain.on('setOnTop', (event, bool) => BrowserWindow.fromWebContents(event.sender).setAlwaysOnTop(bool));

};
