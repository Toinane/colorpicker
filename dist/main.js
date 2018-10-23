"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
class Colorpicker {
    static onWindowAllClosed() {
        if (process.platform !== 'darwin') {
            Colorpicker.application.quit();
        }
    }
    static onClose() {
        Colorpicker.window = null;
    }
    static ready() {
        Colorpicker.window = new electron_1.BrowserWindow({ width: 800, height: 600 });
        Colorpicker.window.on('closed', Colorpicker.onClose);
    }
    static init(app) {
        Colorpicker.application = app;
        Colorpicker.application.on('window-all-closed', Colorpicker.onWindowAllClosed);
        Colorpicker.application.on('ready', Colorpicker.ready);
    }
}
exports.default = Colorpicker;
Colorpicker.init(electron_1.app);
