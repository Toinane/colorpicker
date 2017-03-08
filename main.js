'use strict';

const {app, Menu} = require('electron')
const BrowserWindow = require('electron').BrowserWindow;
const path = require('path');

let win, tray;

function createWindow(){

//var robot = require("robotjs");

// Get mouse position.
//var mouse = robot.getMousePos();

// Get pixel color in hex format.
//var hex = robot.getPixelColor(mouse.x, mouse.y);
//console.log("#" + hex + " at x:" + mouse.x + " y:" + mouse.y);

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

  if(process.platform === 'darwin'){

    var template = [{
      label: "Application",
      submenu: [
          { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
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


    win.loadURL('file://' + __dirname + '/index_osx.html');
  }
  else{
    console.log('toher');
    win.loadURL('file://' + __dirname + '/index.html');
  }


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
  if (win === null) {
    createWindow();
  }
});
