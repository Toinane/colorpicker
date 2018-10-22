import { BrowserWindow, app } from 'electron';

export default class Colorpicker {
  static window: BrowserWindow;
  static application: Electron.App;

  private static onWindowAllClosed() {
    if (process.platform !== 'darwin') {
      Colorpicker.application.quit();
    }
  }

  private static onClose() {
    Colorpicker.window = null;
  }

  private static ready() {
    Colorpicker.window = new BrowserWindow({width: 800, height: 600});
    Colorpicker.window.on('closed', Colorpicker.onClose);
  }

  static init(app: Electron.App) {
    Colorpicker.application = app;
    Colorpicker.application.on('window-all-closed', Colorpicker.onWindowAllClosed);
    Colorpicker.application.on('ready', Colorpicker.ready);
  }
}

Colorpicker.init(app);