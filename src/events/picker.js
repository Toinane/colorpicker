"use strict";

const { ipcMain, screen } = require("electron");
const robot = require("robotjs");

let mouseEvent;
let color;

module.exports = (storage, browsers) => {
  const { picker, colorpicker } = browsers;

  let closePicker = (newColor) => {
    if (typeof newColor !== "string") { newColor = color; }
    if (picker.getWindow()) {
      colorpicker.getWindow().webContents.send("changeColor", newColor);
      colorpicker.getWindow().focus();
      ipcMain.removeListener("closePicker", closePicker);
      ipcMain.removeListener("pickerRequested", (event) => { });
      picker.getWindow().close();
    }
  };

  const linuxSupport = () => {
    const ioHook = require("iohook");

    ioHook.start();

    ioHook.on("mousemove", (event) => {
      if (!picker.getWindow()) { return; }
      let realtime = storage.get("realtime", "picker");
      let { x, y } = event;
      let color = `#${robot.getPixelColor(parseInt(x), parseInt(y))}`;
      picker.getWindow().setPosition(parseInt(x) - 50, parseInt(y) - 50);
      picker.getWindow().webContents.send("updatePicker", color);
      if (realtime) {
        colorpicker.getWindow().webContents.send("previewColor", color);
      }
    });

    ioHook.on("mouseup", (event) => {
      if (!picker.getWindow()) { return; }
      if (event.button === 2) { return closePicker(); }
      let { x, y } = event;
      closePicker(`#${robot.getPixelColor(parseInt(x), parseInt(y))}`);
    });

    let pos = robot.getMousePos();
    picker.getWindow().setPosition(parseInt(pos.x) - 50, parseInt(pos.y) - 50);

    picker
      .getWindow()
      .webContents.send("updatePicker", robot.getPixelColor(pos.x, pos.y));

    ipcMain.on("closePicker", closePicker);
  };

  ipcMain.on("pickerRequested", (event) => {
    let realtime = storage.get("realtime", "picker");
    if (process.platform !== "darwin" && process.platform !== "win32") {
      return linuxSupport();
    }
    if (process.platform === "darwin") { mouseEvent = require("osx-mouse")(); }
    if (process.platform === "win32") { mouseEvent = require("win-mouse")(); }
    color = storage.get("lastColor");

    picker.getWindow().on("close", () => mouseEvent.destroy());

    mouseEvent.on("move", (x, y) => {
      let color = `#${robot.getPixelColor(parseInt(x), parseInt(y))}`;
      const positionScreen = screen.getCursorScreenPoint()

      picker.getWindow().setPosition(positionScreen.x - 50, positionScreen.y - 50);
      picker.getWindow().webContents.send("updatePicker", color);
      if (realtime) {
        colorpicker.getWindow().webContents.send("previewColor", color);
      }
    });

    mouseEvent.on("left-up", (x, y) => {
      closePicker(`#${robot.getPixelColor(parseInt(x), parseInt(y))}`);
    });

    const pos = screen.getCursorScreenPoint()
    picker.getWindow().setPosition(pos.x - 50, pos.y - 50);

    picker
      .getWindow()
      .webContents.send("updatePicker", robot.getPixelColor(pos.x, pos.y));

    ipcMain.on("closePicker", closePicker);
    mouseEvent.on("right-up", closePicker);
  });
};
