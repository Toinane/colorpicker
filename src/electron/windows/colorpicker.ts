import { ipcMain, screen } from 'electron';

import { IColorpickerSettings } from 'src/types/settings';

import Window from '../utils/windowManager';
import Storage from '../utils/storage';
import is from '../utils/is';

class ColorpickerWindow extends Window<IColorpickerSettings> {
  declare store: Storage<IColorpickerSettings>;

  constructor() {
    super('colorpicker', {
      currentColor: 'rgb(60 140 190)',
      history: [],
      sendCrashReport: true,
      theme: 'system',
      tools: ['picker', 'swatch', 'tint', 'contrast'],
      width: 400,
      height: 150,
    });

    // const { scaleFactor } = screen.getPrimaryDisplay();

    this.props = {
      minWidth: 400,
      minHeight: 150,
      alwaysOnTop: is.dev,
    };
  }

  eventsHandle() {
    super.eventsHandle();
    ipcMain.handle('colorpicker:store:get', () => this.store.storage);

    ipcMain.handle('colorpicker:store:update', (_, updatedStore: Partial<IColorpickerSettings>) => {
      console.log(this.window?.getBounds())
      console.log(updatedStore);
      this.store.set(updatedStore);
    });
  }
}

export default ColorpickerWindow;
