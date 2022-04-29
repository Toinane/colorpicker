import path from 'path';
import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';

import is from './is';

export default class Window {
  name: string;

  defaultProps: BrowserWindowConstructorOptions;

  props: BrowserWindowConstructorOptions | undefined;

  window: BrowserWindow | undefined;

  constructor(name: string) {
    this.name = name;

    this.defaultProps = {
      show: false,
      webPreferences: {
        sandbox: true,
        preload: path.resolve(__dirname, '..', 'dist', `${this.name}_preload.js`),
      },
    };
  }

  initWindow(): BrowserWindow {
    this.window = new BrowserWindow({
      ...this.defaultProps,
      ...this.props,
    });

    if (is.dev) {
      this.window.loadURL('http://localhost:3030');
    } else {
      this.window.loadFile('./dist/index.html');
    }

    this.window.on('ready-to-show', () => this.showWindow());
    this.window.on('closed', () => this.closeWindow());

    this.eventsHandle();

    return this.window;
  }

  showWindow(): boolean {
    if (!(this.window instanceof BrowserWindow)) return false;

    this.window.show();
    if (is.dev) this.window.webContents.openDevTools();

    return true;
  }

  closeWindow(): boolean {
    if (!(this.window instanceof BrowserWindow)) return false;
    this.window = undefined;

    return true;
  }

  getWindow(): BrowserWindow {
    if (this.window instanceof BrowserWindow) return this.window;
    return this.initWindow();
  }

  // eslint-disable-next-line class-methods-use-this
  eventsHandle(): void {}
}
