'use strict';

const {BrowserWindow} = require('electron');

module.exports = (dirname, storage) => {

  let win;

  /**
   * [init]
   * @return {void} [new Colorpicker]
   */
  let init = () => {
    const size = storage.get('size');
    if(win === null || win === undefined) {
      createWindow(size.width, size.height, 200, 200);
    } else { win.show(); }
  };

  /**
   * [createWindow - create new Window]
   * @param  {int} width  [width of the window]
   * @param  {int} height [height of the window]
   * @return {void}
   */
  let createWindow = (width, height, x, y) => {
    win = new BrowserWindow({
       frame:false,
       'auto-hide-menu-bar': true,
       width: width,
       height: height,
       x: x,
       y: y,
       minWidth: 438,
       minHeight: 139,
       icon: `${dirname}/build/logo.png`
    });

    win.loadURL(`file://${dirname}/views/colorpicker.html`);

    win.on('closed', event => {
      win = undefined;
    });

    windowEvents(win);
  };

  /**
   * [windowEvents - BrowserWindow events]
   * @param  {BrowserWindow} win [current window]
   * @return {void}
   */
  let windowEvents = win => {

    win.on('resize', event => {
      const size = win.getBounds();
      storage.add({
        size: {
          width: size.width,
          height: size.height
        }
      });
    });

    // win.on('move', event => {
    //   const size = win.getBounds();
    //   settings.pos.x = size.x;
    //   settings.pos.y = size.y;
    //   config.saveSettings('colorpicker', settings);
    // });
  };

  return {
    init: init
  };
}
