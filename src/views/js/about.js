'use strict'

const {ipcRenderer, shell} = require('electron')

document.addEventListener('DOMContentLoaded', () => ipcRenderer.send('init-about'), false)

ipcRenderer.on('init', (event, version) => {
  document.querySelector('#version span').innerHTML = version
})

ipcRenderer.on('update', (event, message) => {
  document.querySelector('#update').innerHTML = message
  if (document.querySelector('#update span')) {
    document.querySelector('#update span').addEventListener('click', function(event) {
      shell.openExternal(this.getAttribute('data-link'))
    })
  }
})

document.querySelector('h1').addEventListener('click', () => {
  shell.openExternal('https://crea-th.at/p/colorpicker/')
})
