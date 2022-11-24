"use strict";

let eventEmitter = require("events");
eventEmitter = new eventEmitter();

const { app, Tray, Menu, shell } = require("electron");
const storage = require("./storage");
const touchbar = require("./touchbar")(__dirname, eventEmitter);
const { searchNewUpdate } = require("./checkUpdate");
const browsers = require("./browsers")(__dirname, storage, {
  touchbar,
  eventEmitter,
});
const { colorpicker, colorsbook, picker, settings } = browsers;

// @TODO remove when electron@9.0.0
app.allowRendererProcessReuse = true;

require("./events")(storage, browsers, eventEmitter);

if (process.platform === "linux") {
  app.disableHardwareAcceleration();
}

let tray;

let createTray = () => {
  if (tray) { return; }
  if (process.platform === "darwin") {
    tray = new Tray(`${__dirname}/ressources/tray-black@3x.png`);
  }
  if (process.platform === "win32") {
    tray = new Tray(`${__dirname}/ressources/tray-black@3x.png`); // color here
  }
  if (process.platform === "linux") {
    tray = new Tray(`${__dirname}/ressources/tray-white@3x.png`);
  }
  if (process.platform === "darwin") {
    tray.setPressedImage(`${__dirname}/ressources/tray-white@3x.png`);
  }
  tray.on("click", (event) => colorpicker.init());
};

/**
 * [setMenu - set new app menu]
 * @return {void}
 */
let setMenu = () => {
  let template = [
    {
      label: "Colorpicker",
      submenu: [
        {
          label: "About Colorpicker",
          accelerator: "Shift+CmdOrCtrl+A",
          click: () => settings.init(),
        },
        { label: `Version ${app.getVersion()}`, enabled: false },
        { type: "separator" },
        {
          label: "Preferences",
          accelerator: "CmdOrCtrl+,",
          click: () => settings.init(),
        },
        { type: "separator" },
        {
          label: "Hide Colorpicker",
          accelerator: "CmdOrCtrl+H",
          role: "minimize",
        },
        {
          label: "Developer",
          submenu: [
            {
              label: "Toggle Devtools",
              accelerator: "CmdOrCtrl+Alt+I",
              role: "toggledevtools",
            },
            {
              label: "Reload Window",
              accelerator: "CmdOrCtrl+R",
              role: "reload",
            },
          ],
        },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: "CmdOrCtrl+Q",
          click: () => app.quit(),
        },
      ],
    },
    {
      label: "Edit",
      role: "editMenu",
    },
    {
      label: "View",
      submenu: [
        {
          label: "Show Colorpicker",
          accelerator: "Shift+CmdOrCtrl+C",
          click: () => colorpicker.init(),
        },
        {
          label: "Show ColorsBook",
          accelerator: "Shift+CmdOrCtrl+B",
          click: () => colorsbook.init(),
        },
        { type: "separator" },
        {
          label: "Save Color",
          accelerator: "CmdOrCtrl+S",
          click: () => colorpicker.getWindow().webContents.send("shortSave"),
        },
        { type: "separator" },
        {
          label: "Copy Hex Color",
          accelerator: "CmdOrCtrl+W",
          click: () => colorpicker.getWindow().webContents.send("shortCopyHex"),
        },
        {
          label: "Copy RGB(a) Color",
          accelerator: "Shift+CmdOrCtrl+W",
          click: () => colorpicker.getWindow().webContents.send("shortCopyRGB"),
        },
        { type: "separator" },
        {
          label: "set Negative Color",
          accelerator: "CmdOrCtrl+N",
          click: () =>
            colorpicker.getWindow().webContents.send("shortNegative"),
        },
      ],
    },
    {
      label: "Tools",
      submenu: [
        {
          label: "Pin to Foreground",
          accelerator: "CmdOrCtrl+F",
          click: () => colorpicker.getWindow().webContents.send("shortPin"),
        },
        { type: "separator" },
        {
          label: "Pick Color",
          accelerator: "CmdOrCtrl+P",
          click: () => picker.init(),
        },
        {
          label: "Get Clipboard's Colors",
          accelerator: "Shift+CmdOrCtrl+V",
          click: () => colorpicker.getWindow().webContents.send("shortApply"),
        },
        {
          label: "Toggle Shading",
          accelerator: "CmdOrCtrl+T",
          click: () => colorpicker.getWindow().webContents.send("shortShading"),
        },
        {
          label: "Set Random Color",
          accelerator: "CmdOrCtrl+M",
          click: () => colorpicker.getWindow().webContents.send("shortRandom"),
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

/**
 * [App ready - On app ready]
 */
app.on("ready", () => {
  storage.init().then(() => {
    // createTray();
    setMenu();
    colorpicker.init();
    searchNewUpdate();
  });
});

/**
 * [App activate - On app icon clicked]
 */
app.on("activate", () => {
  colorpicker.init();
});

/**
 * [App window-all-closed - quit app on all window closed ]
 */
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("web-contents-created", (event, contents) => {
  /**
   * If your app need to navigate, uncomment the condition and update it.
   */
  contents.on("will-navigate", (event, navigationUrl) => {
    shell.openExternal(navigationUrl);
    event.preventDefault();
    //}
  });

  /**
   * We block the creation of new window and open the link in a good navigator.
   */
  contents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
});
