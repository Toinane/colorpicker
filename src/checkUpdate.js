"use strict";

const { app, dialog, shell } = require("electron");
const request = require("request");

module.exports = {
    searchNewUpdate: () => {
        const options = {
            url: "https://colorpicker.fr/release.json",
            method: "GET",
            headers: {
                "content-type": "application/json",
                "user-agent": `colorpicker-${app.getVersion()}`,
            },
        };

        request(options, (err, res, body) => {
            let update = JSON.parse(body);
            if (update.release > app.getVersion()) {
                dialog
                    .showMessageBox(null, {
                        message: "A new update of Colorpicker is available",
                        type: "info",
                        buttons: ["Show Update", "Ignore"],
                    })
                    .then((result) => {
                        if (result.response == 0) {
                            shell.openExternal("https://colorpicker.fr/latest");
                        }
                    });
            }
        });
    },
};
