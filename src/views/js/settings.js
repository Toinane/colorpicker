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
for (let el of document.querySelectorAll('header li')) {
  el.addEventListener('click', function (event) {
    document.querySelector(`#${tabActive}-tab`).classList.remove('active')
    if (document.querySelector('header li.active')) document.querySelector('header li.active').classList.remove('active')
    this.classList.add('active')
    tabActive = this.id
    document.querySelector(`#${tabActive}-tab`).classList.add('active')
  })
}

document.addEventListener('DOMContentLoaded', () => ipcRenderer.send('init-settings'), false)

ipcRenderer.on('init', (event, config) => {
  document.querySelector(`#position li[data-position="${config.posButton}"]`).classList.add('active')
  document.querySelector(`#type-icons li[data-type="${config.typeButton}"]`).classList.add('active')
})

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

function initTools(tools) {

}

function updateTools(event) {
  console.log(event)
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
