"use strict";

const {
  ipcMain,
  BrowserWindow,
  app,
  Notification,
  dialog,
  shell,
} = require("electron");
const request = require("request");
const semver = require("semver");

module.exports = (storage, browsers) => {
  const { colorpicker, picker, colorsbook } = browsers;

  ipcMain.on("init-settings", (event) => {
    let config = {
      versions: {
        colorpicker: app.getVersion(),
        node: process.versions.node,
        electron: process.versions.electron,
        v8: process.versions.v8,
        chrome: process.versions.chrome,
      },
      posButton: storage.get("buttonsPosition"),
      typeButton: storage.get("buttonsType"),
      tools: storage.get("tools"),
      realtime: storage.get("realtime", "picker"),
      colorfullApp: storage.get("colorfullApp"),
    };

    event.sender.send("init", config);
    event.sender.send("export", storage.get("colors", "colorsbook"));
    updateApp(event);
  });

  ipcMain.on("set-position", (event, position) => {
    storage.add({ buttonsPosition: position });
    colorpicker.getWindow().webContents.send("changePosition", position);
  });

  ipcMain.on("set-type-icon", (event, type) => {
    storage.add({ buttonsType: type });
    colorpicker.getWindow().webContents.send("changeTypeIcons", type);
  });

  ipcMain.on("set-colorfull-app", (event, bool) => {
    storage.add({ colorfullApp: bool });
    colorpicker.getWindow().webContents.send("changeColorfullApp", bool);
  });

  ipcMain.on("set-realtime", (event, bool) =>
    storage.add({ realtime: bool }, "picker")
  );

  ipcMain.on("changeTools", (event, tools) => {
    storage.add({ tools: tools });
    colorpicker.getWindow().webContents.send("changeTools", tools);
  });

  ipcMain.on("resetPreferences", async () => {
    const response = await dialog.showMessageBox({
      type: "warning",
      buttons: ["Oh no!", "Reset it!"],
      defaultId: 0,
      message:
        "Are you sure to reset your preferences? \n\n It will remove ALL your colors if you don't have an account!",
    });
    if (response.response === 1) {
      storage.reset();
      app.relaunch({ args: process.argv.slice(1).concat(["--reset"]) });
      app.exit(0);
    }
  });

  function updateApp(event) {
    const options = {
      url: "https://colorpicker.fr/release.json",
      method: "GET",
      headers: {
        "content-type": "application/json",
        "user-agent": `colorpicker-${app.getVersion()}`,
      },
    };

    let message =
      '<i class="fa fa-ban"></i> Can\'t connect to server, check manually <a href="https://github.com/Toinane/colorpicker/releases">here</a>';
    request(options, (err, res, body) => {
      if (err) { return event.sender.send("update", message); }
      let update = JSON.parse(body);
      if (update === undefined || update === null) {
        return event.sender.send("update", message);
      }
      if (semver.lt(update.release, app.getVersion())) {
        return event.sender.send(
          "update",
          '<i class="fa fa-check"></i> You\'re up to date!'
        );
      }
      else {
        let notification = new Notification({
          title: "New update available",
          subtitle: `${update.release} release is available!`,
        });
        notification.show();
        notification.on("click", () => {
          shell.openExternal("https://github.com/Toinane/colorpicker/releases");
        });
        return event.sender.send(
          "update",
          `<i class="fa fa-exclamation-triangle"></i> New update available <a href="${update.link}">here</a>`
        );
      }
    });
  }
};
