"use strict";

class Colorpicker extends Color {
  constructor(config) {
    super();

    this.timing;
    this.history = config.history || [];
    this.colorfullApp = config.colorfullApp;
    this.isShadingActive = false;

    this.body = document.querySelector("body");
    this.hex_value = document.querySelector("#hex_value");
    this.rgbhtml = {
      red_progress: document.querySelector(".red_bar progress"),
      red_input: document.querySelector(".red_bar input"),
      red_range: document.querySelector("#red_value"),
      green_progress: document.querySelector(".green_bar progress"),
      green_input: document.querySelector(".green_bar input"),
      green_range: document.querySelector("#green_value"),
      blue_progress: document.querySelector(".blue_bar progress"),
      blue_input: document.querySelector(".blue_bar input"),
      blue_range: document.querySelector("#blue_value"),
      alpha_range: document.querySelector("#alpha_value"),
      alpha_progress: document.querySelector(".alpha_bar progress"),
      alpha_input: document.querySelector(".alpha_bar input"),
    };

    this.setNewColor(config.color, true);
  }

  setNewRGBColor(rgb) {
    this.setNewColor(this.getHexFromRGB(rgb));
  }

  setNewAlphaColor(alpha) {
    this.setAlpha(alpha);
    this.setNewColor(this.hex);
  }

  setNegativeColor(rgb) {
    if (!rgb) { rgb = this.rgb; }
    const negative = this.getNegativeColor(rgb);
    this.setNewColor(this.getHexFromRGB(negative));
    return negative;
  }

  setNewColor(hex, dontSaveIt) {
    if (!dontSaveIt) {
      clearTimeout(this.timing);
      this.timing = setTimeout(() => this.saveColor(hex), 300);
    }
    this.setColorFromHex(hex);
    this.isDark = this.isDarkColor(this.rgb);

    for (let i = 0, total = Object.keys(this.rgbhtml).length; i < total; i++) {
      if (total - 2 <= i) {
        this.rgbhtml[Object.keys(this.rgbhtml)[i]].value =
          this.rgba[Math.floor(i / 3)] * 255;
      }
      else {
        if (i === 9 && this.rgba[3].toString().length > 4) {
          this.rgbhtml[Object.keys(this.rgbhtml)[i]].value =
            this.rgba[Math.floor(i / 3)].toFixed(2);
        }
        else {
          this.rgbhtml[Object.keys(this.rgbhtml)[i]].value =
            this.rgba[Math.floor(i / 3)];
        }
      }
    }
    this.hex_value.value = this.hex;
    this.body.classList.toggle("darkMode", this.isDark);
    this.body.style.background = this.getCSSFromRGBA(this.rgba);
    if (this.isShadingActive) { this.changeShading(); }

    if (this.colorfullApp) {
      if (this.isDark) {
        document.querySelector("#close").style.color = this.getHexFromRGB(
          this.getLightnessFromRGB(20, this.getRedComplementary())
        );
        document.querySelector("#minimize").style.color = this.getHexFromRGB(
          this.getLightnessFromRGB(20, this.getGreenComplementary())
        );
        document.querySelector("#maximize").style.color = this.getHexFromRGB(
          this.getLightnessFromRGB(20, this.getBlueComplementary())
        );
      } else {
        document.querySelector("#close").style.color = this.getHexFromRGB(
          this.getLightnessFromRGB(-20, this.getRedComplementary())
        );
        document.querySelector("#minimize").style.color = this.getHexFromRGB(
          this.getLightnessFromRGB(-20, this.getGreenComplementary())
        );
        document.querySelector("#maximize").style.color = this.getHexFromRGB(
          this.getLightnessFromRGB(-20, this.getBlueComplementary())
        );
      }
    }
  }

  saveColor(hex) {
    let newHistory = [];
    for (let i = 0; i < 9; i++) {
      if (i === 0) { newHistory[i] = hex; }
      if (this.history.length > i) { newHistory[i + 1] = this.history[i]; }
    }
    this.history = newHistory;

    window.api.send("changeLastColor", hex);
    window.api.send("changeHistory", newHistory);
  }

  copyHex() {
    window.api.send("clipboard", this.hex);
  }

  copyRGB() {
    window.api.send("clipboard", this.getCSSFromRGB(this.rgb));
  }

  copyRGBA() {
    window.api.send("clipboard", this.getCSSFromRGBA(this.rgba));
  }

  changeShading() {
    let shading = document.querySelectorAll(
      "header .shades aside, header .tints aside, header .naturals aside"
    );
    for (let shade of shading) {
      shade.removeEventListener("click", function () {
        cp.setNewColor(this.attributes["data-color"].value);
      });
      shade.parentNode.removeChild(shade);
    }
    for (
      let shades = 1, light = -25, total = 22, html = "";
      shades <= total;
      shades++
    ) {
      let hex = this.getLightnessFromHex(light, this.hex);
      html += `<aside id="shade${shades}" data-color="${hex}" style="background: ${hex}"></aside>`;
      light += 2;
      if (total === shades) { document.querySelector(".shades").innerHTML = html; }
    }

    for (
      let tints = 1, degrees = -100, total = 22, html = "";
      tints <= total;
      tints++
    ) {
      let hex = this.getChangeHueFromHex(degrees, this.hex);
      html += `<aside id="tint${tints}" data-color="${hex}" style="background: ${hex}"></aside>`;
      degrees += 10;
      if (total === tints) { document.querySelector(".tints").innerHTML = html; }
    }

    for (
      let naturals = 1, percent = -84, total = 22, html = "";
      naturals <= total;
      naturals++
    ) {
      let hex = this.getHexFromRGB(this.getNaturalFromRGB(percent, this.rgb));
      html += `<aside id="natural${naturals}" data-color="${hex}" style="background: ${hex}"></aside>`;
      percent += 8;
      if (total === naturals) {
        document.querySelector(".naturals").innerHTML = html;
      }
    }

    shading = document.querySelectorAll(
      "header .shades aside, header .tints aside, header .naturals aside"
    );
    for (let shade of shading) {
      shade.addEventListener("click", function () {
        cp.setNewColor(this.attributes["data-color"].value);
      });
    }
  }
}
