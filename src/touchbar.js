"use strict";

const { TouchBar } = require("electron");
const { TouchBarColorPicker, TouchBarButton } = TouchBar;

module.exports = (dirname, eventEmitter) => {
    let colorpicker = new TouchBarColorPicker({
        change: (color) => eventEmitter.emit("changeColor", color),
    });
    let eyedropper = new TouchBarButton({
        icon: `${dirname}/ressources/eyedropper-touchbar.png`,
        click: () => eventEmitter.emit("launchPicker"),
    });
    let colorsbook = new TouchBarButton({
        icon: `${dirname}/ressources/colorsbook-touchbar.png`,
        click: () => eventEmitter.emit("launchColorsbook"),
    });
    let settings = new TouchBarButton({
        icon: `${dirname}/ressources/settings-touchbar.png`,
        click: () => eventEmitter.emit("showPreferences"),
    });

    let touchbar = new TouchBar([
        colorpicker,
        eyedropper,
        colorsbook,
        settings,
    ]);

    let get = () => touchbar;

    return touchbar;
};
