"use strict";

const { ipcMain, BrowserWindow, app } = require("electron");

module.exports = (storage, browsers) => {
    const { colorpicker, picker, colorsbook } = browsers;

    ipcMain.on("init-preview", (event) => {});
};
