'use strict';

const {BrowserWindow, Menu} = require('electron');

module.exports = (dirname, storage) => {

  let win;

  /**
   * [init]
   * @return {void} [new Hexacolor]
   */
  let init = folder => {
    dirname = folder;
    if(win === null || win === undefined) {
      createWindow(484, 190);
    }
  };

  /**
   * [createWindow - create new Window]
   * @param  {int} width  [width of the window]
   * @param  {int} height [height of the window]
   * @return {void}
   */
  let createWindow = (width, height) => {
    win = new BrowserWindow({
       frame:false,
       'auto-hide-menu-bar': true,
       width: 484,
       height: 190,
       icon: `${dirname}/build/logo.png`
    });

    win.loadURL(`file://${dirname}/views/hexacolor.html`);

    win.on('closed', function(){
      win = undefined;
    });
  };

  return {
    init: init
  }
}
