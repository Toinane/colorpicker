import { BrowserWindow, ipcMain, nativeTheme } from 'electron';
import { resolve } from 'path';

import is from '../services/is';

function ipcHandle(win: BrowserWindow) {
  ipcMain.handle('window:minimize', () => win.minimize());
  ipcMain.handle('window:maximize', () => win.maximize());
  ipcMain.handle('window:maximize:toggle', () =>
    win.isMaximized() ? win.unmaximize() : win.maximize(),
  );
  ipcMain.handle('window:unmaximize', () => win.unmaximize());
  ipcMain.handle('window:close', () => win.close());
}

export default function createWindow() {
  const win: BrowserWindow = new BrowserWindow({
    width: 400,
    height: 250,
    minWidth: 400,
    minHeight: 150,
    frame: false,
    show: false,
    webPreferences: {
      preload: resolve(__dirname, '..', 'dist/main_preload.js'),
      sandbox: true,
    },
  });

  if (is.dev) {
    win.loadURL('http://localhost:3030');
  } else {
    win.loadFile('./dist/index.html');
  }

  win.on('ready-to-show', () => {
    win?.show();
    win?.webContents.openDevTools();
  });

  win.on('closed', () => {});

  nativeTheme.themeSource = 'light';

  ipcHandle(win);
}
