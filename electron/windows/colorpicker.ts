import { BrowserWindow, ipcMain, nativeTheme } from 'electron';

import { IColorpickerSettings } from '@type/settings';

import Window from '../utils/windowManager';
import Storage from '../utils/storage';

class ColorpickerWindow extends Window {
  storage: Storage<IColorpickerSettings>;

  constructor() {
    super('colorpicker');

    this.storage = new Storage<IColorpickerSettings>('colorpicker', {
      color: {
        currentColor: 'lch(67.7125006386685% 34.1781173014796 215.792136442741)',
        history: [],
      },
      settings: {
        sendCrashReport: true,
        theme: 'system',
        tools: ['picker', 'swatch', 'tint', 'contrast'],
      },
    });

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
