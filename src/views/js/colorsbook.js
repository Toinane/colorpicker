'use strict'

const {ipcRenderer, remote, clipboard} = require('electron')
let cm

let colorsbook = {};

document.addEventListener('DOMContentLoaded', () => ipcRenderer.send('init-colorsbook'), false)

ipcRenderer.on('init', (event, config) => {
  cm = new ContextMenu()
  colorsbook = config.colors
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

function addColor (color, category) {

}

function deleteColor (color, category) {

}

function addCategory (name) {
  colorsbook[name] = []
  initColorsbook(colorsbook, 0)
  initEvents()
}

function deleteCategory (name) {

}

function initEvents () {
  let categories = document.querySelectorAll('#categories li')
  for (let categorie of categories) {
    categorie.addEventListener('click', function(event) {
      if(this.id === 'new-categorie') {
        document.querySelector('#popup_category').classList.toggle('active')
      } else {
        document.querySelector('#categories .active').classList.remove('active')
        this.classList.add('active')
        initColors(colorsbook[this.title])
      }
    })
  }
}

document.querySelector('#popup_category').addEventListener('click', function(event) {
  console.log(event.target, this)
  if(event.target === this) { this.classList.toggle('active') }
})
document.querySelector('#popup_category input').addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    let name = this.value
    this.value = ''
    addCategory(name);
    this.parentNode.classList.toggle('active');
  }
})

document.querySelector('#popup_color').addEventListener('click', function(event) {
  if(event.target === this) { this.classList.toggle('active') }
})
