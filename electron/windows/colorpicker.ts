import { BrowserWindow, ipcMain, nativeTheme } from 'electron';

import Window from '../utils/windowManager';

class ColorpickerWindow extends Window {
  constructor() {
    super('colorpicker');

    this.props = {
      width: 400,
      height: 250,
      minWidth: 400,
      minHeight: 150,
      titleBarStyle: 'hidden',
    };

    nativeTheme.themeSource = 'light';
  }

  eventsHandle() {
    if (!(this.window instanceof BrowserWindow)) return;
    const win = this.window;

    ipcMain.handle('window:minimize', () => win.minimize());
    ipcMain.handle('window:maximize', () => win.maximize());
    ipcMain.handle('window:maximize:toggle', () =>
      win.isMaximized() ? win.unmaximize() : win.maximize(),
    );
    ipcMain.handle('window:unmaximize', () => win.unmaximize());
    ipcMain.handle('window:close', () => win.close());
  }
}

export default new ColorpickerWindow();
