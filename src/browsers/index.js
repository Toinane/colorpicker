"use strict";

module.exports = (dirname, storage, util) => ({
    colorpicker: require("./colorpicker")(dirname, storage, util),
    colorsbook: require("./colorsbook")(dirname, storage, util),
    picker: require("./picker")(dirname, storage, util),
    preview: require("./preview")(dirname, storage, util),
    settings: require("./settings")(dirname, storage, util),
    support: require("./support")(dirname, storage, util),
});
