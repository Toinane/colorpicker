"use strict";

class ContextMenu {
  constructor() { }

  openMenu(type) {
    window.api.send("openMenu", type);
  }

  initButtonsType(type, name) {
    const appButtons = document.querySelector("#app_buttons");
    switch (type) {
      case "windows": {
        appButtons.classList = "windows";
        appButtons.innerHTML =
          '<div id="minimize"></div><div id="maximize"></div><div id="close"></div>';
        break;
      }
      case "linux": {
        appButtons.classList = "windows";
        appButtons.innerHTML =
          '<div id="minimize"></div><div id="maximize"></div><div id="close"></div>';
        break;
      }
      default:
        appButtons.classList = "darwin";
        appButtons.innerHTML =
          '<div id="minimize"></div><div id="maximize"></div><div id="close"></div>';
    }

    document.querySelector("#close").onclick = () => {
      window.api.send(`close-${name}`);
    }
    document.querySelector("#minimize").onclick = () => {
      window.api.send(`minimize-${name}`);
    }
    document.querySelector("#maximize").onclick = function () {
      window.api.send(`maximize-${name}`);
    };
  }
}
