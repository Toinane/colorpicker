import path from 'node:path'
import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  nativeTheme,
  screen,
  type Rectangle,
} from 'electron'
import Store, { Schema } from 'electron-store'
import { Logger } from 'winston'

import type { IWindowSchema } from '@interfaces/settings'

import debounce from '@common/debounce'

import createLogger from '@electron/utils/logger'
import { getSafeCenterPosition, isPositionVisible } from '@electron/utils/screen'

/**
 * Base Window class for managing Electron BrowserWindow instances
 * Handles window creation, positioning, persistence, and multi-monitor support
 *
 * @template T - Window schema type extending IWindowSchema
 */
export default class Window<T extends IWindowSchema = IWindowSchema> {
  public name: string
  public window: BrowserWindow | undefined
  public store: Store<T>
  protected logger: Logger
  protected props: BrowserWindowConstructorOptions | undefined
  protected width: number = 400
  protected height: number = 250
  protected x?: number
  protected y?: number
  private readonly defaultProps: BrowserWindowConstructorOptions

  /**
   * Creates a new Window instance
   * Loads stored dimensions and position from electron-store
   * Configures default window properties
   *
   * @param name - Unique identifier for this window type
   * @param schema - electron-store schema for window settings
   */
  constructor(name: string, schema: Schema<T>) {
    this.name = name
    this.logger = createLogger(`Window:${name}`)
    // TODO: make a storage manager to prevent crash from json parse error
    this.store = new Store<T>({
      schema,
      name: this.name + '_window',
      cwd: path.join(app.getPath('userData'), 'config'),
    })
    // END TODO
    this.width = this.store.get('width') ?? this.width
    this.height = this.store.get('height') ?? this.height
    this.x = this.store.get('x')
    this.y = this.store.get('y')

    this.logger.debug('Creating Window instance')

    this.defaultProps = {
      show: false,
      width: this.width,
      height: this.height,
      x: this.x,
      y: this.y,
      frame: false,
      titleBarStyle: 'hidden',
      titleBarOverlay: this.getTitleBarOverlayTheme(),
      webPreferences: {
        sandbox: true,
        preload: path.resolve(__dirname, 'preload', `${this.name}.js`),
      },
    }
  }

  /**
   * Gets title bar overlay configuration based on current system theme
   * Automatically adjusts colors for dark/light mode
   *
   * @returns Title bar overlay options with appropriate colors
   */
  public getTitleBarOverlayTheme(): Electron.TitleBarOverlayOptions {
    return {
      height: 34,
      color: nativeTheme.shouldUseDarkColors ? '#00000000' : '#ffffff00',
      symbolColor: nativeTheme.shouldUseDarkColors ? '#FFFFFF' : '#000000',
    }
  }

  /**
   * Initializes the BrowserWindow instance
   * Creates the window with stored/default properties
   * Registers all event listeners
   * Loads the appropriate content (dev server or local files)
   *
   * @returns Promise resolving to the created BrowserWindow instance
   */
  public async init(): Promise<BrowserWindow> {
    this.logger.info('Initializing Window')
    this.window = new BrowserWindow({
      ...this.defaultProps,
      ...this.props,
    })

    this.registerEvents()

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      const url = new URL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
      url.hash = `#/${this.name}`
      this.logger.debug(`Loading ${url.toString()} url`)
      await this.window.loadURL(url.toString())
    } else {
      this.logger.debug(`Loading local index.html`)
      await this.window.loadFile(
        path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
        {
          hash: this.name,
        },
      )
    }

    return this.window
  }

  /**
   * Shows the window and validates its position
   * Ensures window is visible on screen before showing
   * If position is invalid, centers window on primary display
   *
   * @returns true if window was shown successfully, false if window doesn't exist
   */
  public show(): boolean {
    if (!this.window) return false
    this.logger.debug('Showing Window')

    this.validateWindowPosition()
    this.window.show()
    return true
  }

  /**
   * Closes the window and cleans up the instance
   * Sets window reference to undefined
   *
   * @returns true if window was closed successfully, false if window doesn't exist
   */
  public close(): boolean {
    this.logger.debug('Closing Window')
    if (!this.window) return false

    this.removeEvents()
    this.window = undefined
    return true
  }

  /**
   * Gets the current BrowserWindow instance
   *
   * @returns The BrowserWindow instance if it exists, undefined otherwise
   */
  public getWindow(): BrowserWindow | undefined {
    if (this.window instanceof BrowserWindow) return this.window

    return undefined
  }

  /**
   * Registers all event listeners for the window
   * Sets up handlers for:
   * - Theme changes (updates title bar colors)
   * - Display changes (validates position when monitors added/removed)
   * - Display metrics changes (validates position when resolution/workarea changes)
   * - Window lifecycle events (ready-to-show, closed, resize, move, focus, blur)
   */
  protected registerEvents(): void {
    if (!this.window) return

    this.logger.debug('Registering event listeners')

    nativeTheme.on('updated', () => this.themeListener())
    screen.on('display-added', () => this.validateWindowPosition())
    screen.on('display-removed', () => this.validateWindowPosition())
    screen.on('display-metrics-changed', (event, display, changedMetrics) =>
      this.displayListener(display, changedMetrics),
    )

    this.registerWindowEvents()
  }

  /**
   * Removes all registered event listeners
   * Cleans up theme, screen, and display listeners
   * Should be called when window is being destroyed
   */
  protected removeEvents(): void {
    nativeTheme.removeListener('updated', () => this.themeListener())
    screen.removeListener('display-added', () => this.validateWindowPosition())
    screen.removeListener('display-removed', () => this.validateWindowPosition())
    screen.removeListener('display-metrics-changed', (event, display, changedMetrics) =>
      this.displayListener(display, changedMetrics),
    )
  }

  /**
   * Handles system theme changes
   * Updates title bar overlay colors when OS switches between dark/light mode
   */
  private themeListener(): void {
    if (!this.window) return
    this.logger.debug('Updating titleBarOverlay colors due to system theme change')
    this.window.setTitleBarOverlay(this.getTitleBarOverlayTheme())
  }

  /**
   * Handles display metrics changes
   * Validates window position when display bounds or work area changes
   *
   * @param display - The display that changed
   * @param changedMetrics - Array of metrics that changed (e.g., 'bounds', 'workArea')
   */
  private displayListener(display: Electron.Display, changedMetrics: string[]): void {
    this.logger.debug(`Display metrics changed for display ${display.id}:`, changedMetrics)
    if (changedMetrics.includes('workArea') || changedMetrics.includes('bounds')) {
      this.validateWindowPosition()
    }
  }

  /**
   * Registers window-specific event listeners
   * Sets up handlers for:
   * - ready-to-show: Shows window when ready
   * - closed: Cleans up when window closes
   * - resize/move: Saves new position and size (debounced)
   * - blur/focus: Notifies renderer process of focus state
   */
  private registerWindowEvents(): void {
    if (!this.window) return

    this.logger.debug('Registering window event listeners')

    // Not using ready-to-show for now: https://github.com/electron/electron/issues/42409
    this.window.webContents.on('did-finish-load', () => this.show())

    this.window.on('closed', () => this.close())
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

  /**
   * Updates window size and position in persistent storage
   * Validates position before saving to prevent storing invalid coordinates
   * Skips saving if window is maximized or position is out of bounds
   *
   * Called when window is moved or resized (debounced)
   */
  private updateWindowSizePos(): void {
    if (!this.window || this.window.isMaximized()) {
      this.logger.debug('Window is maximized or invalid, skipping position save')
      return
    }

    const { width, height, x, y } = this.window.getBounds()
    const { wasCorrected } = this.validateAndCorrectPosition({ x, y, width, height })

    if (wasCorrected) {
      this.logger.warn(`Window moved to invalid position (${x}, ${y}), not saving to store`)
      return
    }

    this.logger.debug(`Saving window size (${width}x${height}) and position (${x}, ${y})`)
    this.store.set('width', width)
    this.store.set('height', height)
    this.store.set('x', x)
    this.store.set('y', y)
  }

  /**
   * Validates current window position and corrects if out of bounds
   * Handles multi-monitor scenarios and removed displays
   * If position is invalid, centers window on primary display
   * Updates stored position if correction was needed
   *
   * Called when:
   * - Display is added/removed
   * - Display metrics change
   * - Window is about to be shown
   */
  private validateWindowPosition(): void {
    if (!this.window) return

    const { width, height, x, y } = this.window!.getBounds()

    this.logger.debug(`Validating window position: (${x}, ${y})`)

    const {
      x: validX,
      y: validY,
      wasCorrected,
    } = this.validateAndCorrectPosition({
      x,
      y,
      width,
      height,
    })

    if (wasCorrected) {
      this.logger.info(
        `Window position (${x}, ${y}) is out of bounds, centering at (${validX}, ${validY})`,
      )
      this.window.setBounds({ x: validX, y: validY, width, height })
      this.store.set('x', validX)
      this.store.set('y', validY)
    }
  }

  /**
   * Validates a window position and returns corrected coordinates if needed
   * Checks if window center point is visible on any connected display
   * If not visible, calculates safe centered position on primary display
   *
   * @param position - Window bounds to validate (x, y, width, height)
   * @returns Object containing:
   *   - x: Valid x coordinate
   *   - y: Valid y coordinate
   *   - wasCorrected: true if position was corrected, false if original was valid
   */
  private validateAndCorrectPosition(position: Rectangle): {
    x: number
    y: number
    wasCorrected: boolean
  } {
    if (isPositionVisible(position)) {
      return { x: position.x, y: position.y, wasCorrected: false }
    }

    // Position is invalid, return centered position on primary display
    const centered = getSafeCenterPosition(position.width, position.height)

    this.logger.warn(
      `Window position (${position.x}, ${position.y}) is out of bounds, centering on primary display`,
    )

    this.logger.debug(
      `Calculated safe center position: (${centered.x}, ${centered.y}) on primary display`,
    )
    return { ...centered, wasCorrected: true }
  }
}
