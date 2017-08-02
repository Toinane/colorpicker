'use strict';

const {BrowserWindow} = require('electron');
const config = require('../storage');

let win, dirname, settings;

/**
 * [init]
 * @return {void} [new Colorpicker]
 */
let init = folder => {
  dirname = folder;
  config.getSettings('colorpicker').then(config => {
    settings = config;
    if(win === null || win === undefined) {
      console.log(config)
      createWindow(settings.size.width, settings.size.height, settings.pos.x, settings.pos.y);
    } else { win.show(); }
  });
};

/**
 * [createWindow - create new Window]
 * @param  {int} width  [width of the window]
 * @param  {int} height [height of the window]
 * @return {void}
 */
let createWindow = (width, height, x, y) => {
  win = new BrowserWindow({
     frame:false,
     'auto-hide-menu-bar': true,
     width: width,
     height: height,
     x: x,
     y: y,
     minWidth: 438,
     minHeight: 139,
     icon: `${dirname}/build/logo.png`
  });

  win.loadURL(`file://${dirname}/views/colorpicker.html`);

  win.on('closed', event => {
    win = undefined;
  });

  windowEvents(win);
};

/**
 * [windowEvents - BrowserWindow events]
 * @param  {BrowserWindow} win [current window]
 * @return {void}
 */
let windowEvents = win => {

  win.on('resize', event => {
    const size = win.getBounds();
    settings.size.width = size.width;
    settings.size.height = size.height;
    config.saveSettings('colorpicker', settings);
  });

  win.on('move', event => {
    const size = win.getBounds();
    settings.pos.x = size.x;
    settings.pos.y = size.y;
    config.saveSettings('colorpicker', settings);
  });
};

module.exports = {
  init: init
}
