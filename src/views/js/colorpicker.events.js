'use strict';

const {ipcRenderer} = require('electron');

document.addEventListener('DOMContentLoaded', () => ipcRenderer.send('init-colorpicker'), false);

ipcRenderer.on('lastColor', (event, color) => {
  cp = new Colorpicker(color);
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

document.querySelector('#close').onclick = function() {
  ipcRenderer.send('close');
}

document.querySelector('#minimize').onclick = function() {
  ipcRenderer.send('minimize');
}

document.querySelector('#maximize').onclick = function() {
  this.classList.toggle('active');
  ipcRenderer.send('maximize', this.classList.contains('active'));
}

document.querySelector('#top_button').onclick = function() {
    this.classList.toggle('active');
    ipcRenderer.send('setOnTop', this.classList.contains('active'));
}

document.querySelector('#shade_button').onclick = function() {
  this.classList.toggle('active');
  toggleFlexbox('header .nu');
  toggleFlexbox('header .ni');
}

document.querySelector('#random_button').onclick = function() {
  const r = Math.floor(Math.random() * 255) + 0;
  const g = Math.floor(Math.random() * 255) + 0;
  const b = Math.floor(Math.random() * 255) + 0;
  cp.setNewRGBColor([r, g, b]);
}

document.querySelector('.red_bar input').oninput = function() {
  const red = this.value;
  cp.setNewRGBColor([red, cp.green, cp.blue]);
}

document.querySelector('.green_bar input').oninput = function() {
  const green = this.value;
  cp.setNewRGBColor([cp.red, green, cp.blue]);
}

document.querySelector('.blue_bar input').oninput = function() {
  const blue = this.value;
  cp.setNewRGBColor([cp.red, cp.green, blue]);
}

document.querySelector('#red_value').oninput = function() {
  let red = this.value;
  if (red > 255) red = 255;
  if (red < 0) red = 0;
  cp.setNewRGBColor([red, cp.green, cp.blue]);
}

// document.querySelector('#green_value').oninput = function() {
//   let green = this.value;
//   if (green > 255) green = 255;
//   if (green < 0) green = 0;
//   //cp.setNewRGBColor([cp.red, green, cp.blue]);
// }

document.querySelector('#blue_value').oninput = function() {
  let blue = this.value;
  if (blue > 255) blue = 255;
  if (blue < 0) blue = 0;
  cp.setNewRGBColor([cp.red, cp.green, blue]);
}

document.querySelector('#hex_value').oninput = function() {
  let hex = this.value.replace('#', '');
  if (hex.length !== 6) return;
  cp.setNewColor(hex);
}

let els = document.querySelectorAll('#red_value, #green_value, #blue_value, #hex_value');
for(let el of els){
  el.onfocus = function(){
    this.onkeydown = e => changeHex(e);
    this.onwheel = e => changeHex(e);

    function changeHex(e){
      if (e.keyCode === 38 || e.deltaY < 0) {
        let red = (cp.red >= 255) ? 255 : cp.red + 1;
        let green = (cp.green >= 255) ? 255 : cp.green + 1;
        let blue = (cp.blue >= 255) ? 255 : cp.blue + 1;
        return cp.setNewRGBColor([red, green, blue]);
      }
      else if (e.keyCode === 40 || e.deltaY > 0) {
        let red = (cp.red <= 0) ? 0 : cp.red - 1;
        let green = (cp.green <= 0) ? 0 : cp.green - 1;
        let blue = (cp.blue <= 0) ? 0 : cp.blue - 1;
        return cp.setNewRGBColor([red, green, blue]);
      }
    }
  }
}

let shades = document.querySelectorAll('header .ni aside, header .nu aside');
for (let shade of shades) shade.onclick = () => cp.setNewColor(this.attributes['data-color'].value);
