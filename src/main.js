'use strict';

const {app, Tray, Menu} = require('electron');
const settings = require('./storage');
const {colorpicker, hexacolor, picker} = require('./browsers');

let tray;

settings.init('colorpicker');

let createTray = () => {
	if (tray) return;
	tray = new Tray(`${__dirname}/ressources/tray-black@3x.png`);
  tray.setPressedImage(`${__dirname}/ressources/tray-white@3x.png`);
  tray.on('click', event => colorpicker.init(__dirname));
}

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

app.on('ready', () => {
  createTray();
	setMenu();
  colorpicker.init(__dirname);
  //picker.init(__dirname);
});

app.on('activate', () => {
    colorpicker.init(__dirname);
});

app.on('window-all-closed', function(){
  if(process.platform !== 'darwin') {
    app.quit();
  }
});
