import path from 'path';
import { BrowserWindow, BrowserWindowConstructorOptions, nativeTheme, screen } from 'electron';

import { IWindowSettings } from '@type/settings';

import is from './is';
import Storage from './storage';
import debounce from './debounce';

export default class Window<T extends IWindowSettings> {
  name: string;

  defaultProps: BrowserWindowConstructorOptions;

  props: BrowserWindowConstructorOptions | undefined;

  window: BrowserWindow | undefined;

  store: Storage<IWindowSettings>;

  constructor(name: string, defaultStore: T) {
    const { scaleFactor } = screen.getPrimaryDisplay();

    this.name = name;
    this.store = new Storage<T>(this.name, defaultStore);
    this.defaultProps = {
      show: false,
      titleBarStyle: 'hidden',
      width: (this.store.storage.width || 400) / scaleFactor,
      height: (this.store.storage.height || 250) / scaleFactor,
      webPreferences: {
        sandbox: true,
        preload: path.resolve(__dirname, '..', 'dist', `${this.name}_preload.js`),
      },
    };

    if (this.store.storage.x) this.defaultProps.x = this.store.storage.x;
    if (this.store.storage.y) this.defaultProps.y = this.store.storage.y;
    if (this.store.storage.theme) nativeTheme.themeSource = this.store.storage.theme;
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
    this.window.on(
      'resize',
      debounce(() => this.updateWindowSizePos()),
    );
    this.window.on(
      'move',
      debounce(() => this.updateWindowSizePos()),
    );

    this.eventsHandle();

    return this.window;
  }

  showWindow(): boolean {
    if (!(this.window instanceof BrowserWindow)) return false;

    // this.updateSafeWindowPos();
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

  private updateWindowSizePos(): void {
    if (!(this.window instanceof BrowserWindow)) return;
    const { workAreaSize } = screen.getPrimaryDisplay();
    const { width, height, x, y } = this.window.getBounds();

    if (
      this.window.isMaximized() ||
      x === 0 ||
      y === 0 ||
      width === workAreaSize.width ||
      height === workAreaSize.height
    )
      return;

    this.store.set({
      width,
      height,
      x,
      y,
    });
  }

  private updateSafeWindowPos(): void {
    if (!(this.window instanceof BrowserWindow)) return;
    const { workAreaSize } = screen.getPrimaryDisplay();
    const { x, y } = this.window.getBounds();

    // TODO: Make it work with multiscreen
    if (x <= 0 || y <= 0 || x >= workAreaSize.width || y >= workAreaSize.height)
      this.window.center();
  }
}
