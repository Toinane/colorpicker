"use strict";

const { app, dialog, shell } = require("electron");
const semver = require("semver");

const storage = require("./storage");

module.exports = {
  searchNewUpdate: async () => {
    const url = "https://colorpicker.fr/release.json";
    const headers = {
      "content-type": "application/json",
      "user-agent": `colorpicker-${app.getVersion()}`,
    };

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const body = await response.text();
      let update = JSON.parse(body);

      if (!update || update === null || !update.release) {
        throw new Error("Invalid update data");
      }

      const ignoredVersion = storage.get("update:ignore");
      if (ignoredVersion && semver.eq(ignoredVersion, update.release)) {
        return; // User has chosen to ignore this version
      }

      if (semver.lt(app.getVersion(), update.release)) {
        dialog
          .showMessageBox(null, {
            message: "A new update of Colorpicker is available",
            type: "info",
            defaultId: 1,
            buttons: ["Show Update", "Remind me later", "Don't show again"],
          })
          .then((result) => {
            if (result.response === 0) {
              shell.openExternal(
                "https://github.com/Toinane/colorpicker/releases"
              );
            }
            else if (result.response === 2) {
              storage.add({ "update:ignore": update.release });
            }
          });
      }
    }
    catch (error) {
      console.error("Error while checking for updates", error);
    }
  },
};
