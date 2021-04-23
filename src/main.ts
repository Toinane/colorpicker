import { app, BrowserWindow } from 'electron'

import i18n from './common/localization/i18n.main'

let mainWindow: BrowserWindow | null

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            preload: './dist/preload.js',
        },
    })

    mainWindow.loadFile('./dist/index.html')

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

app.on('ready', createWindow)
app.allowRendererProcessReuse = true

app.commandLine.appendSwitch('force-color-profile', 'srgb') // generic-rgb & macos only
app.disableDomainBlockingFor3DAPIs()
