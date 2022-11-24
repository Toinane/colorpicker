"use strict";

let tabActive = "general";

window.api.send("init-settings");

/* TAB GENERAL */
let options = {
  dragClass: "sortable-drag",
  group: "colorpicker",
  animation: 180,
  onEnd: (event) => updateTools(event),
};
Sortable.create(document.querySelector("#allTools"), options);
Sortable.create(document.querySelector("#selectedTools"), options);

document.querySelector("#reset").addEventListener("click", () => {
  window.api.send("resetPreferences");
});

/* TAB COLORPICKER */
document.querySelector("#colorfull-app").addEventListener("click", function () {
  let bool = this.classList.toggle("active");
  window.api.send("set-colorfull-app", bool);
});

for (let el of document.querySelectorAll("#position li")) {
  el.addEventListener("click", function () {
    document.querySelector("#position .active").classList.remove("active");
    this.classList.add("active");
    window.api.send("set-position", this.getAttribute("data-position"));
  });
}

for (let el of document.querySelectorAll("#type-icons li")) {
  el.addEventListener("click", function () {
    document.querySelector("#type-icons .active").classList.remove("active");
    this.classList.add("active");
    window.api.send("set-type-icon", this.getAttribute("data-type"));
  });
}

/* TAB PICKER */
document
  .querySelector("#picker-realtime")
  .addEventListener("click", function () {
    let bool = this.classList.toggle("active");
    window.api.send("set-realtime", bool);
  });

/* TAB COLORSBOOK */
window.api.on("export", (event, colorsbook) => {
  //document.querySelector('#export').href = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(colorsbook, null, 2))}`;
});

/* GLOBAL */
document.addEventListener(
  "DOMContentLoaded",
  () => window.api.send("init-settings"),
  false
);

for (let el of document.querySelectorAll("header li")) {
  el.addEventListener("click", function (event) {
    document.querySelector(`#${tabActive}-tab`).classList.remove("active");
    if (document.querySelector("header li.active")) {
      document.querySelector("header li.active").classList.remove("active");
    }
    this.classList.add("active");
    tabActive = this.id;
    document.querySelector(`#${tabActive}-tab`).classList.add("active");
  });
}

window.api.on("init", (event, config) => {
  initTools(config.tools);
  document.querySelector("#colorpicker-version").innerHTML =
    config.versions.colorpicker;
  document
    .querySelector(`#position li[data-position="${config.posButton}"]`)
    .classList.add("active");
  document
    .querySelector(`#type-icons li[data-type="${config.typeButton}"]`)
    .classList.add("active");
  if (config.colorfullApp) {
    document.querySelector("#colorfull-app").classList.add("active");
  }
  if (config.realtime) {
    document.querySelector("#picker-realtime").classList.add("active");
  }
});

function initTools(selectedTools) {
  let htmlSelected = "";
  let htmlAll = "";
  let tools = {
    top: { title: "Pin to Foreground", icon: "fa-map-pin" },
    picker: { title: "Pick Color", icon: "fa-eye-dropper" },
    tags: { title: "Open Colorsbook", icon: "fa-bookmark" },
    shade: { title: "Toggle Shading", icon: "fa-tint" },
    random: { title: "Set Random Color", icon: "fa-random" },
    clean: { title: "Focus Mode", icon: "fa-adjust" },
    settings: { title: "Open Settings", icon: "fa-cog" },
  };

  for (let tool of selectedTools) {
    if (tools[tool] !== undefined && tool !== "apply") {
      htmlSelected += `<p id="${tool}_button" class="tools" title="${tools[tool].title}"><i class="fa ${tools[tool].icon}"></i></p>`;
    }
  }
  for (let tool in tools) {
    if (tools[tool] !== undefined && selectedTools.indexOf(tool) === -1) {
      htmlAll += `<p id="${tool}_button" class="tools" title="${tools[tool].title}"><i class="fa ${tools[tool].icon}"></i></p>`;
    }
  }

  document.querySelector("#allTools").innerHTML = htmlAll;
  document.querySelector("#selectedTools").innerHTML = htmlSelected;

  // tippy('.tools', {
  //   delay: 200,
  //   distance: 15,
  //   theme: 'transparent',
  //   size: 'small'
  // })
}

function updateTools(event) {
  let toSave = [];
  let tools = document.querySelectorAll("#selectedTools p");
  for (let tool of tools) {
    let id = tool.id.split("_");
    toSave.push(id[0]);
  }
  window.api.send("changeTools", toSave);
}

window.api.on("update", (event, message) => {
  document.querySelector("#update").innerHTML = message;
});
