const {ipcRenderer} = require('electron')

ipcRenderer.send('picker')

ipcRenderer.on('picker', (event, color) => {
  document.querySelector('body').style.background = color
  document.querySelector('body').innerHTML = color
  ipcRenderer.send('picker')
})
