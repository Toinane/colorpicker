'use strict';

const robot = require('robotjs');
const {BrowserWindow, Menu, ipcMain} = require('electron');

let win, dirname;

ipcMain.on('picker', event => {
  let color = getColor();
  event.sender.send('picker', color);
})

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
 * [getColor description]
 * @return {[type]} [description]
 */
let getColor = () => {
    let mouse = robot.getMousePos();
    let hex = robot.getPixelColor(mouse.x, mouse.y);
    // TODO => faire un carré de pixel, pour avoir les couleurs d'a côtés.

    // console.log("#" + hex + " at x:" + mouse.x + " y:" + mouse.y);
    return '#'+hex;
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
     width: 100,
     height: 100,
     icon: `${dirname}/build/logo.png`
  });

  win.loadURL(`file://${dirname}/views/picker.html`);

  win.openDevTools();

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
  init: init,
  getColor: getColor
}
