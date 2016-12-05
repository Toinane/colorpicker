'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

function createWindow(){

  //mainWindow = new BrowserWindow({frame:false, 'auto-hide-menu-bar': true, width: 820, height: 460, icon: __dirname+'/colorpicker.ico'});
  mainWindow = new BrowserWindow({
     frame:false,
     'auto-hide-menu-bar': true,
     width: 1420,
     height: 700,
     icon: __dirname+'/colorpicker.ico'
  });

  mainWindow.loadURL('file://' + __dirname + '/index.html');
  // FOR DEV
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function(){
    mainWindow = null;
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
