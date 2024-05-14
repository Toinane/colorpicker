import path from 'path';
import { BrowserWindow, BrowserWindowConstructorOptions, nativeTheme, screen } from 'electron';

import { IWindowSettings } from '@type/settings';
import debounce from '@common/debounce';

import is from './is';
import Storage from './storage';

export default class Window<T extends IWindowSettings> {
  name: string;

  defaultProps: BrowserWindowConstructorOptions;

  props: BrowserWindowConstructorOptions | undefined;

  window: BrowserWindow | undefined;

  store: Storage<IWindowSettings>;

  constructor(name: string, defaultStore: T) {
    // const { scaleFactor } = screen.getPrimaryDisplay();

    this.name = name;
    this.store = new Storage<T>(this.name, defaultStore);
    this.defaultProps = {
      show: false,
      titleBarStyle: 'hidden',
      width: (this.store.storage.width || 400),
      height: (this.store.storage.height || 250) ,
      webPreferences: {
        sandbox: true,
        preload: path.resolve(__dirname, '..', 'dist', `${this.name}_preload.js`),
      },
    };

    if (this.store.storage.x) this.defaultProps.x = this.store.storage.x;
    if (this.store.storage.y) this.defaultProps.y = this.store.storage.y;
    if (this.store.storage.theme) nativeTheme.themeSource = this.store.storage.theme;
  }

  async initWindow(): Promise<BrowserWindow> {
    this.window = new BrowserWindow({
      ...this.defaultProps,
      ...this.props,
    });

    if (is.dev) {
      await this.window.loadURL('http://localhost:3030');
    } else {
      await this.window.loadFile('./dist/index.html');
    }

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

  async getWindow(): Promise<BrowserWindow> {
    if (this.window instanceof BrowserWindow) return this.window;
    return this.initWindow();
  }

  eventsHandle(): void {
    if (!this.window) return;

    this.window.on('ready-to-show', () => this.showWindow());
    this.window.on('closed', () => this.closeWindow());
    this.window.on(
      'resize',
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      debounce(() => this.updateWindowSizePos()),
    );
    this.window.on(
      'move',
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      debounce(() => this.updateWindowSizePos()),
    );

    this.window.on('blur', () => this.window?.webContents.send('window:blur', true));
    this.window.on('focus', () => this.window?.webContents.send('window:blur', false));
  }

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
