'use strict';

const {app, Tray, Menu} = require('electron');
const storage = require('./storage');
const events = require('./events')(storage);
const {colorpicker, hexacolor, picker} = require('./browsers')(__dirname, storage);

console.log(app.getPath('userData'))

let tray;

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
    label: 'Colorpicker',
    submenu: [
        { label: 'About Colorpicker', selector: 'orderFrontStandardAboutPanel:' },
				{ label: 'Toggle Devtools', accelerator: 'CmdOrCtrl+Alt+I', role: 'toggledevtools' },
				{ label: 'Reload Window', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'Command+Q', click:() => app.quit()}
    ]}, {
    label: 'Edit',
    submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
    ]}, {
		label: 'Show',
		submenu: [
			{ label: 'Colorpicker', accelerator: 'CmdOrCtrl+Shift+C', click:() => colorpicker.init(true)},
			{ label: 'ColorsBook', accelerator: 'CmdOrCtrl+B', click:() => hexacolor.init()},
			{ label: 'Picker', accelerator: 'CmdOrCtrl+P', click:() => picker.init()}
		]}
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

/**
 * [App ready - On app ready]
 */
app.on('ready', () => {
	storage.init().then(() => {
		createTray();
		setMenu();
		colorpicker.init();
	  //picker.init(__dirname);
	});
});

/**
 * [App activate - On app icon clicked]
 */
app.on('activate', () => {
    colorpicker.init();
});

/**
 * [App window-all-closed - quit app on all window closed ]
 */
app.on('window-all-closed', function(){
  if(process.platform !== 'darwin') {
    app.quit();
  }
});
