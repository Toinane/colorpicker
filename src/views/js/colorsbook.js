'use strict'

const {ipcRenderer, remote, clipboard} = require('electron')
let cm

let colorsbook = {
  'Vert Pastel': [
    '#68938D',
    '#5A8B89',
    '#538586',
    '#497878',
    '#3A666F',
    '#325B6B',
    '#264762',
    '#538586',
    '#497878',
    '#3A666F',
    '#325B6B',
    '#264762',
    '#22405E',
    '#182C55'
  ],
  Toinane: [
    '#542A00',
    '#442002',
    '#FACDA9',
    '#F3BE9B',
    '#E9A388',
    '#C58471',
    '#FEFEFE',
    '#18274B',
    '#D6C2B2'
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
    list += `<li data-color="${color}" style="background: ${color}"</li>`
  }
  list += '<li id="new-color"><i class="fa fa-plus"></i></li>'
  document.querySelector('#colors').innerHTML = list
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
