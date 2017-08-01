'use strict';

const {BrowserWindow, Menu} = require('electron');
const config = require('../settings');

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
      setMenu();
      createWindow(settings.size.width, settings.size.height);
    } else { win.show(); }
  });
};

/**
 * [createWindow - create new Window]
 * @param  {int} width  [width of the window]
 * @param  {int} height [height of the window]
 * @return {void}
 */
let createWindow = (width, height) => {
  win = new BrowserWindow({
     frame:false,
     'auto-hide-menu-bar': true,
     width: width,
     height: height,
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
};

/**
 * [setMenu - set new app menu]
 * @return {void}
 */
let setMenu = () => {
  let template = [{
    label: "Colorpicker",
    submenu: [
        { label: "About Colorpicker", selector: "orderFrontStandardAboutPanel:" },
        { type: "separator" },
        { label: "Quit", accelerator: "Command+Q", click:() => { app.quit(); }}
    ]}, {
    label: "Edit",
    submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
    ]}
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

module.exports = {
  init: init
}
