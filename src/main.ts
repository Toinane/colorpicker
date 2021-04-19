import { app, BrowserWindow } from 'electron'

let mainWindow: BrowserWindow | null

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    })

    mainWindow.loadFile('./dist/index.html')

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

app.on('ready', createWindow)
app.allowRendererProcessReuse = true
