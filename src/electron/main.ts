import { app, BrowserWindow, ipcMain } from 'electron'
import started from 'electron-squirrel-startup'

import createLogger from '@common/logger'
import ColorpickerWindow from './windows/colorpicker'

const logger = createLogger('main')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  logger.info('Exiting Colorpicker due to squirrel startup')
  app.quit()
}

logger.debug('Colorpicker starting...')
app.commandLine.appendSwitch('force-color-profile', 'srgb') // generic-rgb & macos only
app.disableDomainBlockingFor3DAPIs()
app.disableHardwareAcceleration()

const handleMainEvents = () => {
  ipcMain.handle('window:minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win instanceof BrowserWindow) win.minimize()
  })
  ipcMain.handle('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win instanceof BrowserWindow) win.maximize()
  })
  ipcMain.handle('window:maximize:toggle', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!(win instanceof BrowserWindow)) return
    if (win.isMaximized()) win.unmaximize()
    else win.maximize()
  })
  ipcMain.handle('window:unmaximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win instanceof BrowserWindow) win.unmaximize()
  })
  ipcMain.handle('window:close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win instanceof BrowserWindow) win.close()
  })
}

app.on('ready', async () => {
  logger.info('Colorpicker is ready')
  handleMainEvents()
  const cpWin = new ColorpickerWindow()
  await cpWin.initWindow()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', async () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    const cpWin = new ColorpickerWindow()
    await cpWin.initWindow()
  }
})
