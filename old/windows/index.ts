'use strict'

import ColorpickerWindow from './colorpicker';
import ColorsbookWindow from './colorsbook';
import PickerWindow from './picker';
import PreviewWindow from './preview';
import SettingsWindow from './settings';

export default class Window {
  private dirname:string;
  private storage:Colorpicker.Storage;
  private util:object;

  constructor(dirname:string, storage:Colorpicker.Storage, util:object) {
    this.dirname = dirname;
    this.storage = storage;
    this.util = util;
  }

  public getWindows():object {
    return {
      colorpicker: new ColorpickerWindow(this.dirname, this.storage, this.util),
      colorsbook: new ColorsbookWindow(this.dirname, this.storage, this.util),
      picker: new PickerWindow(this.dirname, this.storage, this.util),
      preview: new PreviewWindow(this.dirname, this.storage, this.util),
      settings: new SettingsWindow(this.dirname, this.storage, this.util)
    }
  }
}