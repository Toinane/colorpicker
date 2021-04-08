"use strict";

module.exports = (storage, browsers, eventEmitter) => ({
    colorpicker: require("./colorpicker")(storage, browsers, eventEmitter),
    colorsbook: require("./colorsbook")(storage, browsers, eventEmitter),
    picker: require("./picker")(storage, browsers, eventEmitter),
    preview: require("./preview")(storage, browsers, eventEmitter),
    settings: require("./settings")(storage, browsers, eventEmitter),
});
