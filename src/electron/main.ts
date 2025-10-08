import { app, BrowserWindow } from 'electron'
import started from 'electron-squirrel-startup'

import { getPlatformDetails } from '@electron/utils/platform'
import createLogger from '@electron/utils/logger'
import ColorpickerWindow from './windows/colorpicker'
import SettingsWindow from './windows/settings'

app.setAppUserModelId('com.toinane.colorpicker')
app.enableSandbox()

const logger = createLogger('main')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  logger.info('Exiting Colorpicker due to squirrel startup')
  app.quit()
}

// show colorpicker version
logger.info('Initializing Colorpicker ' + app.getVersion())
logger.info('Running on platform:', getPlatformDetails())

// https://github.com/electron/electron/issues/10732
// app.commandLine.appendSwitch('force-color-profile', 'srgb')

app.on('ready', async () => {
  logger.info('Colorpicker is ready')
  const cpWin = new ColorpickerWindow()
  await cpWin.init()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    logger.info('All windows closed, quitting Colorpicker')
    logger.info('Bye bye!')
    app.quit()
  }
})

app.on('activate', async () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    logger.info('Re-activating Colorpicker app')
    const cpWin = new ColorpickerWindow()
    await cpWin.init()
  }
})
