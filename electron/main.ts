import { app, BrowserWindow } from 'electron';

let mainWindow: BrowserWindow | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3030');
  } else {
    mainWindow.loadFile('./dist/index.html');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.commandLine.appendSwitch('force-color-profile', 'srgb'); // generic-rgb & macos only
app.disableDomainBlockingFor3DAPIs();
