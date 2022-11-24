"use strict";

const { BrowserWindow, nativeImage } = require("electron");

module.exports = (dirname, storage) => {
  let win;

  /**
   * [init]
   * @param {boolean} force [force launching new window]
   * @return {void} [new Colorpicker]
   */
  let init = () => {
    if (win === null || win === undefined) { createWindow(); }
    else { win.show(); }
  };

  /**
   * [createWindow - create new Window]
   * @param  {int} width  [width of the window]
   * @param  {int} height [height of the window]
   * @return {void}
   */
  let createWindow = () => {
    let options = {
      width: 400,
      height: 300,
      resizable: false,
      fullscreenable: false,
      icon: nativeImage.createFromPath(`${dirname}/build/icon.png`),
      webPreferences: {
        preload: `${dirname}/preload.js`,
      },
    };

    win = new BrowserWindow(options);
    win.loadURL(`file://${dirname}/views/preview.html`);

    win.on("closed", () => {
      win = undefined;
    });
  };

  let getWindow = () => win;

  return {
    init: init,
    getWindow: getWindow,
  };
};
