'use strict';

const {ipcRenderer} = require('electron');

document.addEventListener('DOMContentLoaded', () => ipcRenderer.send('init-colorpicker'), false);

ipcRenderer.on('lastColor', (event, color) => {
  console.log(color);
});

ipcRenderer.on('buttonsPosition', (event, pos) => {
  console.log(pos);
});

ipcRenderer.on('buttonsType', (event, type) => {
  console.log(type);
});

function changeLastColor(color) {
  ipcRenderer.send('changeLastColor', color);
}

function changebuttonsPosition(pos) {
  ipcRenderer.send('buttonsPosition', pos);
}

function changebuttonsType(type) {
  ipcRenderer.send('buttonsType', type);
}
