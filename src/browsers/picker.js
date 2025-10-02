"use strict";

const { BrowserWindow, nativeImage, systemPreferences } = require("electron");

module.exports = (dirname, storage) => {
  let win;

  let init = () => {
    if (process.platform === "darwin") {
      const hasPermission = systemPreferences.getMediaAccessStatus("screen");
      if (hasPermission !== "granted") {
        systemPreferences.askForMediaAccess("screen");
        return;
      }
    }

    if (win === null || win === undefined) {
      createWindow();
    }
  };

  let createWindow = () => {
    win = new BrowserWindow({
      frame: false,
      autoHideMenuBar: true,
      width: 100,
      height: 100,
      transparent: true,
      alwaysOnTop: true,
      resizable: false,
      focusable: true,
      hasShadow: false,
      icon: nativeImage.createFromPath(`${dirname}/build/icon.png`),
      webPreferences: {
        preload: `${dirname}/preload.js`,
      },
    });

    win.loadURL(`file://${dirname}/views/picker.html`);
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
