"use strict";

const { app, dialog, shell } = require("electron");
const request = require("request");
const semver = require("semver");

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
      if (semver.gt(update.release, app.getVersion())) {
        dialog
          .showMessageBox(null, {
            message: "A new update of Colorpicker is available",
            type: "info",
            defaultId: 1,
            buttons: ["Show Update", "Ignore"],
          })
          .then((result) => {
            if (result.response === 0) {
              shell.openExternal(
                "https://github.com/Toinane/colorpicker/releases"
              );
            }
          });
      }
    });
  },
};
