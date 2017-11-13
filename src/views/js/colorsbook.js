'use strict'

const {ipcRenderer, remote, clipboard} = require('electron')
let cm

let colorsbook = {
  'flat': [
    '#2196F3',
    '#00BCD4',
    '#4CAF50',
    '#8BC34A',
    '#FFEB3B',
    '#FF9800',
    '#FF5722',
    '#F44336',
    '#673AB7',
    '#3F51B5',
    '#607D8B'
  ],
  'pastel': [
    '#7E93C8',
    '#8FC1E2',
    '#AFBBE3',
    '#EFCAC4',
    '#E19494',
    '#F8AF85',
    '#F9C48C',
    '#C2BB9B',
    '#B0D9CD',
    '#6B8790',
    '#AC94C9'
  ]
}

document.addEventListener('DOMContentLoaded', () => ipcRenderer.send('init-colorsbook'), false)

ipcRenderer.on('init', (event, config) => {
  cm = new ContextMenu()
  if (config.posButton === 'right') document.querySelector('.toolbar').classList.add('setRight')
  cm.initButtonsType(config.typeButton, 'colorsbook')
  initColorsbook(colorsbook, 0)
  initEvents()
})

ipcRenderer.on('hasLooseFocus', (event, looseFocus) => document.querySelector('html').classList.toggle('blured', looseFocus))
ipcRenderer.on('changeTypeIcons', (event, type) => cm.initButtonsType(type, 'colorsbook'))
ipcRenderer.on('changePosition', (event, position) => {
  if (position === 'right') document.querySelector('.toolbar').classList.add('setRight')
  else document.querySelector('.toolbar').classList.remove('setRight')
})

function initColorsbook (colorsbook, activeAt) {
  let categories = ''
  for (let categorie in colorsbook) {
    if (Object.keys(colorsbook).indexOf(categorie) === activeAt) {
      initColors(colorsbook[categorie])
      categories += `<li title="${categorie}" class="active" style="background: ${colorsbook[categorie][0]}">${categorie}</li>`
    }
    else categories += `<li title="${categorie}" style="background: ${colorsbook[categorie][0]}">${categorie}</li>`
  }
  categories += '<li id="new-categorie"><i class="fa fa-plus"></i></li>'
  document.querySelector('#categories').innerHTML = categories
}

function initColors (colors) {
  let list = ''
  for (let color of colors) {
    list += `<li class="color" data-color="${color}" style="background: ${color}"</li>`
  }
  list += '<li id="new-color"><i class="fa fa-plus"></i></li>'
  document.querySelector('#colors').innerHTML = list

  for(let color of document.querySelectorAll('.color')) {
    color.addEventListener('click', event => {
      ipcRenderer.send('colorsbook-change-color', color.dataset.color)
    })
    color.addEventListener('contextmenu', event => {
      cm.openMenu('colorMenu')
    })
  }
}

function deleteColor () {

}

function initEvents () {
  let categories = document.querySelectorAll('#categories li')
  for (let categorie of categories) {
    categorie.addEventListener('click', function(event) {
      document.querySelector('#categories .active').classList.remove('active')
      this.classList.add('active')
      initColors(colorsbook[this.title])
    })
  }
}
