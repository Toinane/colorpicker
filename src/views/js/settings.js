'use strict'

const {ipcRenderer, shell} = require('electron')
let Sortable = require('sortablejs')

let tabActive = 'general';

/* TAB GENERAL */
let options = {
  dragClass: "sortable-drag",
  group: "colorpicker",
  animation: 180,
  onEnd: event => updateTools(event)
}
Sortable.create(document.querySelector('#allTools'), options)
Sortable.create(document.querySelector('#selectedTools'), options)

/* TAB COLORPICKER */
for (let el of document.querySelectorAll('#position li')) {
  el.addEventListener('click', function () {
    document.querySelector('#position .active').classList.remove('active')
    this.classList.add('active')
    ipcRenderer.send('set-position', this.getAttribute('data-position'))
  })
}

for (let el of document.querySelectorAll('#type-icons li')) {
  el.addEventListener('click', function () {
    document.querySelector('#type-icons .active').classList.remove('active')
    this.classList.add('active')
    ipcRenderer.send('set-type-icon', this.getAttribute('data-type'))
  })
}

/* TAB PICKER */
for (let el of document.querySelectorAll('#zoom-level li')) {
  el.addEventListener('click', function () {
    document.querySelector('#zoom-level .active').classList.remove('active')
    this.classList.add('active')
    ipcRenderer.send('changeSizePicker', this.getAttribute('data-zoom'))
  })
}


/* GLOBAL */
document.addEventListener('DOMContentLoaded', () => ipcRenderer.send('init-settings'), false)

for (let el of document.querySelectorAll('header li')) {
  el.addEventListener('click', function (event) {
    document.querySelector(`#${tabActive}-tab`).classList.remove('active')
    if (document.querySelector('header li.active')) document.querySelector('header li.active').classList.remove('active')
    this.classList.add('active')
    tabActive = this.id
    document.querySelector(`#${tabActive}-tab`).classList.add('active')
  })
}

ipcRenderer.on('init', (event, config) => {
  initTools(config.tools)
  document.querySelector('#colorpicker-version').innerHTML = config.versions.colorpicker
  document.querySelector('#electron-version').innerHTML = config.versions.electron
  document.querySelector('#node-version').innerHTML = process.versions.node
  document.querySelector('#chrome-version').innerHTML = process.versions.chrome
  document.querySelector('#v8-version').innerHTML = process.versions.v8
  document.querySelector(`#position li[data-position="${config.posButton}"]`).classList.add('active')
  document.querySelector(`#type-icons li[data-type="${config.typeButton}"]`).classList.add('active')
  document.querySelector(`#zoom-level li[data-zoom="${config.zoomLevel}"]`).classList.add('active')
})

function initTools(selectedTools) {
  let htmlSelected = ''
  let htmlAll = ''
  let tools = {
    top: { title: 'Pin to Foreground', icon: 'fa-map-pin' },
    picker: { title: 'Pick Color', icon: 'fa-eyedropper' },
    tags: { title: 'Open Colorsbook', icon: 'fa-bookmark' },
    shade: { title: 'Toggle Shading', icon: 'fa-tint' },
    random: { title: 'Set Random Color', icon: 'fa-random' },
    opacity: { title: 'Toggle Opacity', icon: 'fa-sliders' },
    clean: { title: 'Clean Vue', icon: 'fa-adjust' },
    apply: { title: 'Get Clipboard\'s Colors', icon: 'fa-magic' },
    settings: { title: 'Open Settings', icon: 'fa-gear' }
  }

  for (let tool of selectedTools) {
    htmlSelected += `<p id="${tool}_button" title="${tools[tool].title}"><i class="fa ${tools[tool].icon}"></i></p>`
  }
  for (let tool in tools) {
    if (selectedTools.indexOf(tool) === -1) {
      htmlAll += `<p id="${tool}_button" title="${tools[tool].title}"><i class="fa ${tools[tool].icon}"></i></p>`
    }
  }

  document.querySelector('#allTools').innerHTML = htmlAll;
  document.querySelector('#selectedTools').innerHTML = htmlSelected;
}

function updateTools(event) {
  let toSave = []
  let tools = document.querySelectorAll('#selectedTools p')
  for (let tool of tools) {
    let id = tool.id.split('_')
    toSave.push(id[0]);
  }
  ipcRenderer.send('changeTools', toSave)
}

//
// ipcRenderer.on('init', (event, version) => {
//   document.querySelector('#version span').innerHTML = version
// })
//
// ipcRenderer.on('update', (event, message) => {
//   document.querySelector('#update').innerHTML = message
//   if (document.querySelector('#update span')) {
//     document.querySelector('#update span').addEventListener('click', function(event) {
//       shell.openExternal(this.getAttribute('data-link'))
//     })
//   }
// })
//
// document.querySelector('h1').addEventListener('click', () => {
//   shell.openExternal('https://crea-th.at/p/colorpicker/')
// })
