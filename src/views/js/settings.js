'use strict'

const {ipcRenderer, shell} = require('electron')

let els = document.querySelectorAll('header li')
for (let el of els) {
  el.addEventListener('click', function (event) {
    if(document.querySelector('header li.active')) document.querySelector('header li.active').classList.remove('active')
    this.classList.add('active')
  })
}




// document.addEventListener('DOMContentLoaded', () => ipcRenderer.send('init-about'), false)
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
