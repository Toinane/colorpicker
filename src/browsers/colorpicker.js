'use strict';

const {BrowserWindow, Menu} = require('electron');

let win, dirname;

/**
 * [init]
 * @return {void} [new Colorpicker]
 */
let init = folder => {
  dirname = folder;
  if(win === null || win === undefined) {
    setMenu();
    createWindow(484, 190);
  }
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
     width: 484,
     height: 190,
     icon: `${dirname}/build/logo.png`
  });

  win.loadURL(`file://${dirname}/views/colorpicker.html`);

  win.on('closed', function(){
    win = undefined;
  });
};

/**
 * [setMenu]
 * @return {void} [Set new menu]
 */
let setMenu = () => {
  let template = [{
    label: "Colorpicker",
    submenu: [
        { label: "About Colorpicker", selector: "orderFrontStandardAboutPanel:" },
        { type: "separator" },
        { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
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
