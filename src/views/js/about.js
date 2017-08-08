'use strict'

const {ipcRenderer, shell} = require('electron')

document.addEventListener('DOMContentLoaded', () => ipcRenderer.send('init-about'), false)

ipcRenderer.on('init', (event, config) => {

})

document.querySelector('h1').addEventListener('click', () => {
  shell.openExternal('https://crea-th.at/p/colorpicker/')
})
