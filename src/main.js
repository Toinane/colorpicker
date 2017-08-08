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
      { label: 'About Colorpicker', 'accelerator': 'Shift+CmdOrCtrl+A', click: () => about.init() },
			{ label: `Version ${app.getVersion()}`, active: false},
			{ type: 'separator' },
			{ label: 'Preferences', accelerator: 'CmdOrCtrl+,', click: () => settings.init() },
			{ type: 'separator' },
			{ label: 'Hide Colorpicker', accelerator: 'CmdOrCtrl+H', role: 'minimize' },
			{ label: 'Developer',
				submenu: [
					{ label: 'Toggle Devtools', accelerator: 'CmdOrCtrl+Alt+I', role: 'toggledevtools' },
					{ label: 'Reload Window', accelerator: 'CmdOrCtrl+R', role: 'reload' }
			]},
      { type: 'separator' },
      { label: 'Quit', accelerator: 'Command+Q', click:() => app.quit()}
    ]}, {
    label: 'Edit', role: 'editMenu'
		}, {
		label: 'View',
		submenu: [
			{ label: 'Show Colorpicker', accelerator: 'Shift+CmdOrCtrl+C', click:() => colorpicker.init()},
			{ label: 'Show ColorsBook', accelerator: 'Shift+CmdOrCtrl+B', click:() => hexacolor.init()},
			{ type: 'separator' },
			{label: 'Save Color' , accelerator: 'CmdOrCtrl+S', click: () => this.save(), active: false},
			{type: 'separator'},
			{label: 'Copy Hex Color', accelerator: 'CmdOrCtrl+W', click: () => this.copyHex()},
			{label: 'Copy RGB(a) Color', accelerator: 'Shift+CmdOrCtrl+W', click: () => this.copyRGB()},
			{type: 'separator'},
			{label: 'set Negative Color', accelerator: 'CmdOrCtrl+N', click: () => this.setNegative()}
		]}, {
		label: 'Tools',
		submenu: [
			{ label: 'Pin to Foreground', type: 'checkbox', accelerator: 'CmdOrCtrl+F', click:() => colorpicker.init()},
			{ type: 'separator' },
			{ label: 'Pick Color', accelerator: 'CmdOrCtrl+P', click:() => picker.init()},
			{ label: 'Toggle Shading', type: 'checkbox', accelerator: 'CmdOrCtrl+T', click: () => this.copyHex()},
			{ label: 'Toggle Opacity', type: 'checkbox', accelerator: 'CmdOrCtrl+O', click: () => this.copyHex()},
			{ label: 'Set Random Color', accelerator: 'CmdOrCtrl+M', click: () => this.copyRGB()},
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
