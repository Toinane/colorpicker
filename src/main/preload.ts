import { contextBridge, ipcRenderer } from 'electron'
import i18nextBackend from 'i18next-electron-fs-backend'

contextBridge.exposeInMainWorld('api', {
    i18nextElectronBackend: i18nextBackend.preloadBindings(ipcRenderer),
})
