import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: {
      maximize: () => ipcRenderer.invoke('window:maximize'),
      toggle: () => ipcRenderer.invoke('window:maximize:toggle'),
      unmaximize: () => ipcRenderer.invoke('window:unmaximize'),
    },
    close: () => ipcRenderer.invoke('window:close'),
  },
  colorpicker: {
    store: {
      get: () => ipcRenderer.invoke('colorpicker:store:get'),
    },
  },
});
