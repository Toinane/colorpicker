'use strict';

const {ipcRenderer} = require('electron');

class ContextMenu {

  constructor() {
    this.menu = document.querySelector('#contextMenu');
    this.menuActive = false;
    this.colorpickerMenu = [
      {text: 'Save color', id: 'savecolor'},
      'separator',
      {text: 'Copy Hex code', id: 'copyhexcode'},
      {text: 'Copy RGB code', id: 'copyrgbcode'},
      {text: 'Copy RGBA code', id: 'copyrgbacode'},
      'separator',
      {text: 'set Negative Color', id: 'setnegativecolor'}
    ]
  }

  openMenu(type, x, y) {
    this.menuActive = true;
    this.setMenu(type);
    this.menu.style.top = `${y}px`;
    this.menu.style.left = `${x}px`;
    this.menu.style.display = 'block';
  }

  closeMenu() {
    this.menu.style.display = 'none';
    this.menuActive = false;
  }

  setMenu(type) {
    let menu = '';
    this[type].map(el => {
      if (el === 'separator') menu += '<li class="separator"></li>';
      else menu += `<li id="${el.id}">${el.text}</li>`;
    });
    this.menu.innerHTML = menu;
  }

}



let cm = new ContextMenu();
