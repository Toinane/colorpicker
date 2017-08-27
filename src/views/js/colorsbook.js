'use strict'

const {ipcRenderer, remote, clipboard} = require('electron')
let cm

document.addEventListener('DOMContentLoaded', () => ipcRenderer.send('init-colorsbook'), false)

ipcRenderer.on('init', (event, config) => {
  cm = new ContextMenu()
  if (config.posButton === 'right') document.querySelector('.toolbar').classList.add('setRight')
  cm.initButtonsType(config.typeButton, 'colorsbook')
})

ipcRenderer.on('hasLooseFocus', (event, looseFocus) => document.querySelector('html').classList.toggle('blured', looseFocus))
ipcRenderer.on('changeTypeIcons', (event, type) => cm.initButtonsType(type, 'colorsbook'))
ipcRenderer.on('changePosition', (event, position) => {
  if (position === 'right') document.querySelector('.toolbar').classList.add('setRight')
  else document.querySelector('.toolbar').classList.remove('setRight')
})
