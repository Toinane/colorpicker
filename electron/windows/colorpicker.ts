import { ipcMain, screen } from 'electron';

import { IColorpickerSettings } from '@type/settings';

import Window from '../utils/windowManager';
import Storage from '../utils/storage';

class ColorpickerWindow extends Window<IColorpickerSettings> {
  declare store: Storage<IColorpickerSettings>;

  constructor() {
    super('colorpicker', {
      currentColor: 'lch(67.7125006386685% 34.1781173014796 215.792136442741)',
      history: [],
      sendCrashReport: true,
      theme: 'system',
      tools: ['picker', 'swatch', 'tint', 'contrast'],
      width: 400,
      height: 250,
    });

    const { scaleFactor } = screen.getPrimaryDisplay();

    this.props = {
      minWidth: 400 / scaleFactor,
      minHeight: 150 / scaleFactor,
    };
  }

  eventsHandle() {
    ipcMain.handle('colorpicker:store:get', () => this.store.storage);
  }
}

export default ColorpickerWindow;
