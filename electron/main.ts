import { app, BrowserWindow, ipcMain } from 'electron';

import ColorpickerWindow from './windows/colorpicker';

app.commandLine.appendSwitch('force-color-profile', 'srgb'); // generic-rgb & macos only
app.disableDomainBlockingFor3DAPIs();
app.disableHardwareAcceleration();

const handleMainEvents = () => {
  ipcMain.handle('window:minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win instanceof BrowserWindow) win.minimize();
  });
  ipcMain.handle('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win instanceof BrowserWindow) win.maximize();
  });
  ipcMain.handle('window:maximize:toggle', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!(win instanceof BrowserWindow)) return;
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  });
  ipcMain.handle('window:unmaximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win instanceof BrowserWindow) win.unmaximize();
  });
  ipcMain.handle('window:close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win instanceof BrowserWindow) win.close();
  });
};

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.on('ready', async () => {
  handleMainEvents();
  const cpWin = new ColorpickerWindow();
  await cpWin.initWindow();
});
