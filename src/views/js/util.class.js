'use strict';

class ContextMenu {

  constructor() {
    this.menu = document.querySelector('#contextMenu');
    this.menuActive = false;
    this.colorpickerMenu = [
      {name: 'Save color', id: 'savecolor'},
      'separator',
      {name: 'Copy Hex code', id: 'copyhexcode'},
      {name: 'Copy RGB code', id: 'copyrgbcode'},
      {name: 'Copy RGBA code', id: 'copyrgbacode'},
      'separator',
      {name: 'set Negative Color', id: 'setnegativecolor'}
    ]
  }

  openMenu(type, x, y) {
    this.menuActive = true;
    console.log(type, x, y);

  }


}


let cm = new ContextMenu();
