"use strict";

const { ipcMain, clipboard, Menu } = require("electron");

module.exports = (storage, browsers, eventEmitter) => {
  const { colorpicker, settings, picker, colorsbook } = browsers;
  let win;
  let shading;

  eventEmitter.on("changeColor", (color) => {
    console.log(color);
    // win.webContents.send("changeColor", color);
  });

  ipcMain.on("init-colorpicker", (event) => {
    win = colorpicker.getWindow();
    let config = {
      color: storage.get("lastColor") ? storage.get("lastColor") : "#00AEEF",
      posButton: storage.get("buttonsPosition"),
      typeButton: storage.get("buttonsType"),
      tools: storage.get("tools"),
      colorfullApp: storage.get("colorfullApp"),
      history: storage.get("history"),
    };

    event.sender.send("init", config);
  });

  ipcMain.on("changeLastColor", (event, color) => {
    storage.add({ lastColor: color });
  });

  ipcMain.on("saveColor", (event, color) => {
    let colorsbook = storage.get("colors", "colorsbook");
    colorsbook[
      Object.getOwnPropertyNames(colorsbook)[
      Object.values(colorsbook).length - 1
      ]
    ].push(color);
    storage.add({ colors: colorsbook }, "colorsbook");
  });

  ipcMain.on("changeHistory", (event, array) => {
    storage.add({ history: array });
    eventEmitter.emit("updateHistory", array);
  });

  ipcMain.on("clipboard", (event, color) => {
    clipboard.writeText(color);
  });

  ipcMain.on("openMenu", (event, type) => {
    let menu;
    switch (type) {
      case "colorpickerMenu": {
        menu = Menu.buildFromTemplate([
          {
            label: "Pin to Foreground",
            accelerator: "CmdOrCtrl+F",
            click: () => event.sender.send("shortPin"),
          },
          { type: "separator" },
          {
            label: "Save Color",
            accelerator: "CmdOrCtrl+S",
            click: () => event.sender.send("shortSave"),
          },
          {
            label: "Copy Hex Code",
            accelerator: "CmdOrCtrl+W",
            click: () => event.sender.send("shortCopyHex"),
          },
          {
            label: "Copy RGB Code",
            accelerator: "Shift+CmdOrCtrl+W",
            click: () => event.sender.send("shortCopyRGB"),
          },
          {
            label: "Copy RGBA Code",
            accelerator: "Shift+CmdOrCtrl+W",
            click: () => event.sender.send("shortCopyRGBA"),
          },
          { type: "separator" },
          {
            label: "Pick Color",
            accelerator: "CmdOrCtrl+P",
            click: () => picker.init(),
          },
          {
            label: "Toggle Shading",
            accelerator: "CmdOrCtrl+T",
            click: () => event.sender.send("shortShading"),
          },
          { type: "separator" },
          {
            label: "Set Random Color",
            accelerator: "CmdOrCtrl+M",
            click: () => event.sender.send("shortRandom"),
          },
          {
            label: "set Negative Color",
            accelerator: "CmdOrCtrl+N",
            click: () => event.sender.send("shortNegative"),
          },
          { type: "separator" },
          {
            label: "Preferences",
            accelerator: "CmdOrCtrl+,",
            click: () => settings.init(),
          },
        ]);
        menu.popup(this.window);
        break;
      }
      case "colorMenu": {
        menu = Menu.buildFromTemplate([
          { label: "Delete", click: () => event.sender.send("deleteColor") },
        ]);
        menu.popup(this.window);
        break;
      }
      case "categoryMenu": {
        menu = Menu.buildFromTemplate([
          { label: "Delete", click: () => event.sender.send("deleteCategory") },
        ]);
        menu.popup(this.window);
        break;
      }
    }
  });

  ipcMain.on("shadingActive", (event, bool) => {
    shading = bool;
    let size = win.getSize();
    if (shading && size[1] < 220) { win.setSize(size[0], 220, true); }
    if (shading) { return win.setMinimumSize(440, 220); }
    if (!shading) { return win.setMinimumSize(440, 150); }
  });

  ipcMain.on("minimize-colorpicker", (event) => win.minimize());
  ipcMain.on("maximize-colorpicker", (event) => {
    if (win.isMaximized()) { return win.unmaximize(); }
    else { return win.maximize(); }
  });
  ipcMain.on("close-colorpicker", (event) => win.close());
  ipcMain.on("setOnTop", (event, bool) => win.setAlwaysOnTop(bool));
  ipcMain.on("launchPicker", (event) => picker.init());
  eventEmitter.on("launchPicker", (event) => picker.init());
  ipcMain.on("launchColorsbook", (event) => colorsbook.init());
  eventEmitter.on("launchColorsbook", (event) => colorsbook.init());
  ipcMain.on("showPreferences", (event) => settings.init());
  eventEmitter.on("showPreferences", (event) => settings.init());
};
