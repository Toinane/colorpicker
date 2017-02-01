'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');

let win, tray;

function createWindow(){

   /*app.setUserTasks([
  {
    program: __dirname+'/main.js',
    arguments: '',
    iconPath: __dirname+'/colorpicker.ico',
    iconIndex: 0,
    title: 'Nouveau colorpicker',
    description: 'Nouvelle fenêtre colorpicker'
  }
])
*/


  //mainWindow = new BrowserWindow({frame:false, 'auto-hide-menu-bar': true, width: 820, height: 460, icon: __dirname+'/colorpicker.ico'});
  win = new BrowserWindow({
     frame:false,
     'auto-hide-menu-bar': true,
     width: 484,
     height: 190,
     icon: __dirname+'/logo.png'
  });

  //win.setSkipTaskbar(true);


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
