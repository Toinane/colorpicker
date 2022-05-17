const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  send: (channel, args) => ipcRenderer.send(channel, args),
  on: (channel, callback) => ipcRenderer.on(channel, callback),
});
