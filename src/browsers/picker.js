'use strict';

const { BrowserWindow } = require('electron');

module.exports = (dirname, storage) => {
    let win;

    let init = () => {
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
            icon: `${dirname}/build/icon.png`,
            webPreferences: {
                nodeIntegration: true
            }
        });

        win.loadURL(`file://${dirname}/views/picker.html`);
        win.on('closed', () => {
            win = undefined;
        });
    };

    let getWindow = () => win;

    return {
        init: init,
        getWindow: getWindow
    };
};
