"use strict";

let cm;

let colorsbook = {};
let categoryActive;
let categoryFocused;
let colorFocused;

document.addEventListener(
  "DOMContentLoaded",
  () => window.api.send("init-colorsbook"),
  false
);

window.api.on("init", (event, config) => {
  cm = new ContextMenu();
  colorsbook = config.colors;
  if (config.posButton === "right") {
    document.querySelector(".toolbar").classList.add("setRight");
  }
  cm.initButtonsType(config.typeButton, "colorsbook");
  initColorsbook(colorsbook, 0);
  initEvents();
});

window.api.on("hasLooseFocus", (event, looseFocus) =>
  document.querySelector("html").classList.toggle("blured", looseFocus)
);
window.api.on("changeTypeIcons", (event, type) =>
  cm.initButtonsType(type, "colorsbook")
);
window.api.on("changePosition", (event, position) => {
  if (position === "right") {
    document.querySelector(".toolbar").classList.add("setRight");
  }
  else { document.querySelector(".toolbar").classList.remove("setRight"); }
});

window.api.on("deleteColor", () => deleteColor());
window.api.on("deleteCategory", () => deleteCategory());

function initColorsbook(colorsbook, activeAt) {
  let categories = "";
  for (let category in colorsbook) {
    if (category === activeAt || !categoryActive) {
      categoryActive = category;
      initColors(colorsbook[category]);
      categories += `<li title="${category}" class="active" style="background: ${colorsbook[category][0]}">${category}</li>`;
    } else {
      categories += `<li title="${category}" style="background: ${colorsbook[category][0]}">${category}</li>`;
    }
  }
  categories += '<li id="new-categorie"><i class="fa fa-plus"></i></li>';
  document.querySelector("#categories").innerHTML = categories;
}

function initColors(colors) {
  let list = "";
  for (let color of colors) {
    list += `<li class="color" title="${color}" style="background: ${color}"</li>`;
  }
  list += '<li id="new-color"><i class="fa fa-plus"></i></li>';
  document.querySelector("#colors").innerHTML = list;

  for (let color of document.querySelectorAll(".color")) {
    color.addEventListener("click", (event) => {
      window.api.send("colorsbook-change-color", color.title);
    });
    color.addEventListener("contextmenu", function (event) {
      colorFocused = this.title;
      cm.openMenu("colorMenu");
    });
  }

  document.querySelector("#new-color").addEventListener("click", () => {
    document.querySelector("#popup_color").classList.toggle("active");
    document.querySelector("#popup_color input").focus();
  });
}

function addColor(color) {
  if (!categoryActive) { categoryActive = Object.values(colorsbook).length - 1; }
  colorsbook[categoryActive].push(color);
  initColorsbook(colorsbook, categoryActive);
  initEvents();
  saveColorsbook();
}

function deleteColor() {
  let pos = colorsbook[categoryActive].indexOf(colorFocused);
  colorsbook[categoryActive].splice(pos, 1);
  initColorsbook(colorsbook, categoryActive);
  initEvents();
  saveColorsbook();
}

function addCategory(name) {
  colorsbook[name] = [];
  categoryActive = name;
  initColorsbook(colorsbook, name);
  initEvents();
  saveColorsbook();
}

function deleteCategory() {
  colorsbook[categoryFocused] = undefined;
  categoryActive = false;
  initColorsbook(colorsbook);
  initEvents();
  saveColorsbook();
}

function saveColorsbook() {
  window.api.send("save-colorsbook", colorsbook);
}

function initEvents() {
  let categories = document.querySelectorAll("#categories li");
  for (let category of categories) {
    category.addEventListener("contextmenu", function (event) {
      categoryFocused = this.title;
      cm.openMenu("categoryMenu");
    });
    category.addEventListener("click", function (event) {
      if (this.id === "new-categorie") {
        document.querySelector("#popup_category").classList.toggle("active");
        document.querySelector("#popup_category input").focus();
      } else {
        document
          .querySelector("#categories .active")
          .classList.remove("active");
        this.classList.add("active");
        categoryActive = this.title;
        initColors(colorsbook[this.title]);
      }
    });
  }
}

document
  .querySelector("#popup_category")
  .addEventListener("click", function (event) {
    if (event.target === this) {
      this.classList.toggle("active");
    }
  });
document
  .querySelector("#popup_category input")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      let name = this.value;
      this.value = "";
      addCategory(name);
      this.parentNode.classList.toggle("active");
    }
  });

document
  .querySelector("#popup_color")
  .addEventListener("click", function (event) {
    if (event.target === this) {
      this.classList.toggle("active");
    }
  });
document
  .querySelector("#popup_color input")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      const regex = /^([0-9a-fA-F]{3}|([0-9a-fA-F]{6}))$/g;
      let color = this.value.replace("#", "");
      if (!regex.test(color)) { return; }
      this.value = "";
      addColor(`#${color}`);
      this.parentNode.classList.toggle("active");
    }
  });
