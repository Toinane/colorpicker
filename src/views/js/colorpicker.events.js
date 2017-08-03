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


document.querySelector('#top_button').onclick = function(){
    this.classList.toggle('active');
    ipcRenderer.send('setOnTop', this.classList.contains('active'));
}

document.querySelector('#nuances').onclick = () => {
  document.querySelector('#nuances').classList.toggle('active');
  this.toggleFlexbox('header .nu');
  this.toggleFlexbox('header .ni');
}

document.querySelector('#random').onclick = ()=>{
  var r = Math.floor(Math.random() * 255) + 0,
  g = Math.floor(Math.random() * 255) + 0,
  b = Math.floor(Math.random() * 255) + 0;
  this.changeColor(r, g, b);
}

document.querySelector('#minimize').onclick = function(){
  remote.getCurrentWindow().minimize();
}
document.querySelector('#square').onclick = function(){
  var window = remote.getCurrentWindow();
  if(this.maximize){
     window.unmaximize();
     this.maximize = false;
  }
  else{
     window.maximize();
     this.maximize = true;
  }
}
document.querySelector('#close').onclick = function(){
  remote.getCurrentWindow().close();
}

document.querySelector('.red_bar input').oninput = () =>{
  this.r = document.querySelector('.red_bar input').value
  this.changeColor(this.r, this.g, this.b);
}
document.querySelector('.green_bar input').oninput = () =>{
  this.g = document.querySelector('.green_bar input').value;
  this.changeColor(this.r, this.g, this.b);
}
document.querySelector('.blue_bar input').oninput = () =>{
  this.b = document.querySelector('.blue_bar input').value;
  this.changeColor(this.r, this.g, this.b);
}

document.querySelector('#red_value').oninput = function(e){
  var red = this.value;
  if(red > 255){this.value = 255; red = 255;}
  if(red < 0){this.value = 0; red = 0;}
  self.changeColor(red, self.g, self.b);
}
document.querySelector('#green_value').oninput = function(e){
  var green = this.value;
  if(green > 255){this.value = 255; green = 255;}
  if(green < 0){this.value = 0; green = 0;}
  self.changeColor(self.r, green, self.b);
}
document.querySelector('#blue_value').oninput = function(e){
  var blue = this.value;
  if(blue > 255){this.value = 255; blue = 255;}
  if(blue < 0){this.value = 0; blue = 0;}
  self.changeColor(self.r, self.g, blue);
}
document.querySelector('#hex_value').oninput = function(e){
  var hex = this.value.replace('#', '');
  if(hex.length == 6){
     var color = self.hexToRGB('#'+hex);
     if(color.r && color.g && color.b){
        self.changeColor(color.r, color.g, color.b);
     }
  }
}


var els = document.querySelectorAll('#red_value, #green_value, #blue_value, #hex_value');
for(let el of els){
  el.onfocus = function(){
     this.onkeydown = function(e){
        var val = this.value.replace('#', '');
        changeHex(e, val);
     }
     this.onwheel = function(e){
        var val = this.value.replace('#', '');
        changeHex(e, val);
     }
     function changeHex(e, hex){
        var color = self.hexToRGB('#'+hex);
        if(hex.length == 6){
           if(e.keyCode == 38 || e.deltaY < 0){
              if(color.r >= 255){color.r = 254;}
              if(color.g >= 255){color.g = 254;}
              if(color.b >= 255){color.b = 254;}
              self.changeColor(color.r+1, color.g+1, color.b+1);
           }
           else if(e.keyCode == 40 || e.deltaY > 0){
              if(color.r <= 0){color.r = 1;}
              if(color.g <= 0){color.g = 1;}
              if(color.b <= 0){color.b = 1;}
              self.changeColor(color.r-1, color.g-1, color.b-1);
           }
        }
     }
  }
}
var els = document.querySelectorAll('header .ni aside, header .nu aside');
for(let el of els){
  el.onclick = function(){
     var color = self.hexToRGB(this.attributes['data-color'].value);
     self.changeColor(color.r, color.g, color.b);
  }
}
