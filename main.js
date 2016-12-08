'use strict';

const electron = require('electron');
const Tray = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let win, tray;

function createWindow(){

   /*tray = new Tray(__dirname+'/colorpicker.png')
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Test', type: 'radio'},
    {label: 'Item2', type: 'radio'},
    {label: 'Item3', type: 'radio', checked: true},
    {label: 'Item4', type: 'radio'}
  ])
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)*/

  //mainWindow = new BrowserWindow({frame:false, 'auto-hide-menu-bar': true, width: 820, height: 460, icon: __dirname+'/colorpicker.ico'});
  win = new BrowserWindow({
     frame:false,
     'auto-hide-menu-bar': true,
     width: 484,
     height: 190,
     icon: __dirname+'/colorpicker.ico'
  });

  win.loadURL('file://' + __dirname + '/index.html');

  // FOR DEV
  //win.webContents.openDevTools();


  //win.setOverlayIcon(__dirname+'/colorpicker-min.ico', 'Little application to get color code')

  // Emitted when the window is closed.
  win.on('closed', function(){
    win = null;
  });

}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function(){
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if(process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function(){
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
