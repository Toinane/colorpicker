import { app, BrowserWindow } from 'electron';

let mainWindow: BrowserWindow | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 250,
    minWidth: 400,
    minHeight: 150,
    frame: false,
    show: false,
    webPreferences: {
      preload: './dist/main_preload.js',
      sandbox: true,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3030');
  } else {
    mainWindow.loadFile('./dist/index.html');
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.webContents.openDevTools();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.commandLine.appendSwitch('force-color-profile', 'srgb'); // generic-rgb & macos only
app.disableDomainBlockingFor3DAPIs();
app.disableHardwareAcceleration();
