import path from 'path'
import { BrowserWindow, BrowserWindowConstructorOptions, nativeTheme, screen } from 'electron'
import Store, { Schema } from 'electron-store'

import type { IWindowSchema } from '@interfaces/settings'
import debounce from '@common/debounce'
import createLogger from '@common/logger'
import is from '@electron/utils/is'

const logger = createLogger('Window')

export default class Window<T extends IWindowSchema> {
  name: string
  defaultProps: BrowserWindowConstructorOptions
  props: BrowserWindowConstructorOptions | undefined
  window: BrowserWindow | undefined
  store: Store<T>

  constructor(name: string, schema: Schema<T>) {
    logger.debug(`Creating ${name} Window instance`)
    // const { scaleFactor } = screen.getPrimaryDisplay();

    this.name = name
    this.store = new Store<T>({ schema, name: this.name + 'Window' })

    this.defaultProps = {
      show: false,
      titleBarStyle: 'hidden',
      width: this.store.get('width') || 400,
      height: this.store.get('height') || 250,
      webPreferences: {
        sandbox: true,
        preload: path.resolve(__dirname, `${this.name}.js`),
      },
    }

    if (this.store.get('x')) this.defaultProps.x = this.store.get('x')
    if (this.store.get('y')) this.defaultProps.y = this.store.get('y')
    if (this.store.get('theme')) nativeTheme.themeSource = this.store.get('theme')
  }

  async initWindow(): Promise<BrowserWindow> {
    logger.info(`Initializing ${this.name} Window`)
    this.window = new BrowserWindow({
      ...this.defaultProps,
      ...this.props,
    })

    this.eventsHandle()

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      logger.debug(`Loading ${MAIN_WINDOW_VITE_DEV_SERVER_URL} in ${this.name} Window`)
      await this.window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
    } else {
      logger.debug(`Loading local index.html in ${this.name} Window`)
      await this.window.loadFile(
        path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      )
    }

    return this.window
  }

  showWindow(): boolean {
    logger.debug(`Showing ${this.name} Window`)
    if (!(this.window instanceof BrowserWindow)) return false

    // this.updateSafeWindowPos();
    this.window.show()
    if (is.dev) this.window.webContents.openDevTools()

    return true
  }

  closeWindow(): boolean {
    logger.debug(`Closing ${this.name} Window`)
    if (!(this.window instanceof BrowserWindow)) return false
    this.window = undefined

    return true
  }

  async getWindow(): Promise<BrowserWindow> {
    if (this.window instanceof BrowserWindow) return this.window
    return this.initWindow()
  }

  eventsHandle(): void {
    if (!this.window) return

    this.window.on('ready-to-show', () => this.showWindow())
    this.window.on('closed', () => this.closeWindow())
    this.window.on(
      'resize',
      debounce(() => this.updateWindowSizePos()),
    )
    this.window.on(
      'move',
      debounce(() => this.updateWindowSizePos()),
    )

    this.window.on('blur', () => this.window?.webContents.send('window:blur', true))
    this.window.on('focus', () => this.window?.webContents.send('window:blur', false))
  }

  private updateWindowSizePos(): void {
    if (!(this.window instanceof BrowserWindow)) return
    const { workAreaSize } = screen.getPrimaryDisplay()
    const { width, height, x, y } = this.window.getBounds()

    if (
      this.window.isMaximized() ||
      x === 0 ||
      y === 0 ||
      width === workAreaSize.width ||
      height === workAreaSize.height
    )
      return

    this.store.set('width', width)
    this.store.set('height', height)
    this.store.set('x', x)
    this.store.set('y', y)
  }

  private updateSafeWindowPos(): void {
    if (!(this.window instanceof BrowserWindow)) return
    const { workAreaSize } = screen.getPrimaryDisplay()
    const { x, y } = this.window.getBounds()

    // TODO: Make it work with multiscreen
    if (x <= 0 || y <= 0 || x >= workAreaSize.width || y >= workAreaSize.height)
      this.window.center()
  }
}
