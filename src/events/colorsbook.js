"use strict";

const { ipcMain } = require("electron");

module.exports = (storage, browsers) => {
    const { colorpicker, settings, colorsbook } = browsers;
    let win;

    ipcMain.on("init-colorsbook", (event) => {
        win = colorsbook.getWindow();
        let config = {};
        config.posButton = storage.get("buttonsPosition");
        config.typeButton = storage.get("buttonsType");
        config.colors = storage.get("colors", "colorsbook");

        event.sender.send("init", config);
    });

    ipcMain.on("minimize-colorsbook", (event) => win.minimize());
    ipcMain.on("maximize-colorsbook", (event, bool) => {
        if (bool) { return win.maximize(); }
        return win.unmaximize();
    });
    ipcMain.on("close-colorsbook", (event) => win.close());

    ipcMain.on("save-colorsbook", (event, colorsbook) =>
        storage.add({ colors: colorsbook }, "colorsbook")
    );

    ipcMain.on("colorsbook-change-color", (event, color) =>
        colorpicker.getWindow().webContents.send("previewColor", color)
    );
};
