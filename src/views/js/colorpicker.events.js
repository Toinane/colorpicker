"use strict";

let cp;
let cm;

document.addEventListener(
  "DOMContentLoaded",
  () => window.api.send("init-colorpicker"),
  false
);

window.api.on("init", (event, config) => {
  cp = new Colorpicker({
    color: config.color,
    history: config.history,
    colorfullApp: config.colorfullApp,
  });
  cm = new ContextMenu();
  if (config.posButton === "right") {
    document.querySelector(".toolbar").classList.add("setRight");
  }
  cm.initButtonsType(config.typeButton, "colorpicker");
  initTools(config.tools);
  initToolsEvent();
  initEvents();
});

window.api.on("changeColor", (event, color) => cp.setNewColor(color));
window.api.on("previewColor", (event, color) => cp.setNewColor(color, true));
window.api.on("changeColorfullApp", (event, bool) => (cp.colorfullApp = bool));
window.api.on("shortSave", () => window.api.send("saveColor", cp.hex));
window.api.on("shortCopyHex", () => cp.copyHex());
window.api.on("shortCopyRGB", () =>
  cp.activeAlpha ? cp.copyRGBA() : cp.copyRGB()
);
window.api.on("shortCopyRGBA", () => cp.copyRGBA());
window.api.on("shortNegative", () => cp.setNegativeColor());
window.api.on("shortPin", () => togglePin());
window.api.on("shortShading", () => toggleShading());
window.api.on("shortRandom", () => toggleRandom());
window.api.on("shortApply", () => applyColor());

window.api.on("hasLooseFocus", (event, looseFocus) =>
  document.querySelector("html").classList.toggle("blured", looseFocus)
);

window.api.on("changePosition", (event, position) => {
  if (position === "right") {
    document.querySelector(".toolbar").classList.add("setRight");
  }
  else { document.querySelector(".toolbar").classList.remove("setRight"); }
});

window.api.on("changeTypeIcons", (event, type) =>
  cm.initButtonsType(type, "colorpicker")
);
window.api.on("changeTools", (event, tools) => {
  initTools(tools);
  initToolsEvent();
});

function initTools(tools) {
  let html = "";
  let allTools = {
    top: { title: "Pin to Foreground", icon: "fa-map-pin" },
    picker: { title: "Pick Color", icon: "fa-eye-dropper" },
    tags: { title: "Open Colorsbook", icon: "fa-bookmark" },
    shade: { title: "Toggle Shading", icon: "fa-tint" },
    random: { title: "Set Random Color", icon: "fa-random" },
    clean: { title: "Focus Mode", icon: "fa-adjust" },
    apply: { title: "Get Clipboard's Colors", icon: "fa-clone" },
    settings: { title: "Open Settings", icon: "fa-cog" },
  };

  for (let tool of tools) {
    if (allTools[tool] !== undefined) {
      html += `<p id="${tool}_button" title="${allTools[tool].title}"><i class="fas ${allTools[tool].icon}"></i></p>`;
    }
  }



  document.querySelector("#tools").innerHTML = html;
}

function changeLastColor(color) {
  window.api.send("changeLastColor", color);
}

function changebuttonsPosition(pos) {
  window.api.send("buttonsPosition", pos);
}

function changebuttonsType(type) {
  window.api.send("buttonsType", type);
}

function togglePin() {
  let bool = document.querySelector("#top_button").classList.toggle("active");
  window.api.send("setOnTop", bool);
}

function toggleShading() {
  let bool = document.querySelector("#shade_button").classList.toggle("active");
  if (bool) { cp.changeShading(); }
  cp.isShadingActive = bool;
  window.api.send("shadingActive", bool);
  document.querySelector("header").classList.toggle("shading");
}

function toggleRandom() {
  const r = Math.floor(Math.random() * 255) + 0;
  const g = Math.floor(Math.random() * 255) + 0;
  const b = Math.floor(Math.random() * 255) + 0;
  cp.setNewRGBColor([r, g, b]);
}

function toggleClean() {
  let bool = document.querySelector("#clean_button").classList.toggle("active");
  document.querySelector("body").classList.toggle("clean");
}

function initToolsEvent() {
  if (document.querySelector("#top_button")) {
    document.querySelector("#top_button").onclick = () => togglePin();
  }
  if (document.querySelector("#picker_button")) {
    document.querySelector("#picker_button").onclick = () =>
      window.api.send("launchPicker");
  }
  if (document.querySelector("#tags_button")) {
    document.querySelector("#tags_button").onclick = () =>
      window.api.send("launchColorsbook");
  }
  if (document.querySelector("#shade_button")) {
    document.querySelector("#shade_button").onclick = () => toggleShading();
  }
  if (document.querySelector("#random_button")) {
    document.querySelector("#random_button").onclick = () => toggleRandom();
  }
  if (document.querySelector("#clean_button")) {
    document.querySelector("#clean_button").onclick = () => toggleClean();
  }
  if (document.querySelector("#settings_button")) {
    document.querySelector("#settings_button").onclick = () =>
      window.api.send("showPreferences");
  }
}

function initEvents() {
  window.addEventListener("contextmenu", (event) => {
    cm.openMenu("colorpickerMenu");
  });

  document
    .querySelector(".toolbar")
    .addEventListener("dblclick", function (event) {
      if (event.target !== this) { return; }
      window.api.send("maximize-colorpicker");
    });

  document.querySelector(".red_bar input").oninput = function () {
    const red = this.value;
    cp.setNewRGBColor([red, cp.green, cp.blue]);
  };

  document.querySelector(".green_bar input").oninput = function () {
    const green = this.value;
    cp.setNewRGBColor([cp.red, green, cp.blue]);
  };

  document.querySelector(".blue_bar input").oninput = function () {
    const blue = this.value;
    cp.setNewRGBColor([cp.red, cp.green, blue]);
  };

  document.querySelector(".alpha_bar input").oninput = function () {
    cp.setNewAlphaColor(this.value / 255);
  };

  document.querySelector("#red_value").oninput = function () {
    let red = this.value;
    if (red > 255) { red = 255; }
    if (red < 0) { red = 0; }
    cp.setNewRGBColor([red, cp.green, cp.blue]);
  };

  document.querySelector("#green_value").oninput = function () {
    let green = this.value;
    if (green > 255) { green = 255; }
    if (green < 0) { green = 0; }
    cp.setNewRGBColor([cp.red, green, cp.blue]);
  };

  document.querySelector("#blue_value").oninput = function () {
    let blue = this.value;
    if (blue > 255) { blue = 255; }
    if (blue < 0) { blue = 0; }
    cp.setNewRGBColor([cp.red, cp.green, blue]);
  };

  document.querySelector("#alpha_value").oninput = function () {
    let alpha = this.value;
    if (alpha === "0.") { return; }
    if (alpha === "1.") { return cp.setNewAlphaColor(1); }
    if (isNaN(alpha) || alpha.length > 4) { return cp.setNewAlphaColor(0); }
    if (alpha > 1) { alpha = 1; }
    if (alpha < 0) { alpha = 0; }
    cp.setNewAlphaColor(alpha);
  };

  document.querySelector("#hex_value").oninput = function () {
    let hex = this.value.replace("#", "");
    if (hex.length !== 6) { return; }
    cp.setNewColor(hex);
  };

  let els = document.querySelectorAll(
    "#red_value, #green_value, #blue_value, #hex_value"
  );
  for (let el of els) {
    el.onfocus = function () {
      this.onkeydown = (e) => changeHex(e);
      this.onwheel = (e) => changeHex(e);

      function changeHex(e) {
        if (e.keyCode === 38 || e.deltaY < 0) {
          e.preventDefault();
          let red = cp.red >= 255 ? 255 : cp.red + 1;
          let green = cp.green >= 255 ? 255 : cp.green + 1;
          let blue = cp.blue >= 255 ? 255 : cp.blue + 1;
          return cp.setNewRGBColor([red, green, blue]);
        } else if (e.keyCode === 40 || e.deltaY > 0) {
          e.preventDefault();
          let red = cp.red <= 0 ? 0 : cp.red - 1;
          let green = cp.green <= 0 ? 0 : cp.green - 1;
          let blue = cp.blue <= 0 ? 0 : cp.blue - 1;
          return cp.setNewRGBColor([red, green, blue]);
        }
      }
    };
  }
}
