"use strict";

class Color {
  constructor(r, g, b) {
    this.alpha = 1;
    this.activeAlpha = false;
    this.setColor(r, g, b);
  }

  setColor(r, g, b) {
    this.red = parseInt(r, 10);
    this.green = parseInt(g, 10);
    this.blue = parseInt(b, 10);
    this.rgb = [r, g, b];
    this.rgba = [r, g, b, this.alpha];
    this.hex = this.getHexFromRGB(this.rgb);
    this.hsl = this.getHSLFromRGB(this.rgb);
    return true;
  }

  setAlpha(alpha) {
    this.alpha = alpha;
  }

  setColorFromRGB(rgb) {
    this.setColor(rgb[0], rgb[1], rgb[2], 1);
    return true;
  }

  setColorFromHex(hex) {
    const rgb = this.getRGBFromHex(hex);
    this.setColorFromRGB(rgb);
    return true;
  }

  setColorFromHSL(hsl) {
    const rgb = this.getRGBFromHSL(hsl);
    this.setColorFromRGB(rgb);
    return true;
  }

  getCSSFromRGB(rgb) {
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  }

  getCSSFromRGBA(rgba) {
    return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3].toFixed(2)})`;
  }

  getRGBAFromRGB(rgb) {
    return rgb.concat([this.alpha]);
  }

  getRGBFromRGBA(rgba) {
    return [rgba[0], rgba[1], rgba[2]];
  }

  getHexFromRGB(rgb) {
    let hex = [
      Number(rgb[0]).toString(16),
      Number(rgb[1]).toString(16),
      Number(rgb[2]).toString(16),
    ];
    for (let i = 0; i < 3; i++) {
      if (hex[i] < 10 || hex[i].length === 1) { hex[i] = `0${hex[i]}`; }
    }
    return `#${hex.join("").toUpperCase()}`;
  }

  getRGBFromHex(hex) {
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    let num = parseInt(hex, 16);
    return [num >> 16, (num >> 8) & 255, num & 255];
  }

  getRGBAFromHex(hex) {
    return this.getRGBFromHex(hex).concat([this.alpha]);
  }

  getHSLFromRGB(rgb) {
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    let min = Math.min(r, g, b);
    let max = Math.max(r, g, b);
    let delta = max - min;
    let h;
    let s;
    let l;

    if (max === min) { h = 0; }
    else if (r === max) { h = (g - b) / delta; }
    else if (g === max) { h = 2 + (b - r) / delta; }
    else if (b === max) { h = 4 + (r - g) / delta; }

    h = Math.min(h * 60, 360);
    if (h < 0) { h += 360; }
    l = (min + max) / 2;

    if (max === min) { s = 0; }
    else if (l <= 0.5) { s = delta / (max + min); }
    else { s = delta / (2 - max - min); }

    return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
  }

  getRGBFromHSL(hsl) {
    let h = hsl[0] / 360;
    let s = hsl[1] / 100;
    let l = hsl[2] / 100;
    let t1;
    let t2;
    let t3;
    let rgb;
    let val;

    if (s === 0) {
      val = l * 255;
      return [val, val, val];
    }
    if (l < 0.5) { t2 = l * (1 + s); }
    else { t2 = l + s - l * s; }

    t1 = 2 * l - t2;
    rgb = [0, 0, 0];

    for (let i = 0; i < 3; i++) {
      t3 = h + (1 / 3) * -(i - 1);
      if (t3 < 0) { t3++; }
      if (t3 > 1) { t3--; }
      if (6 * t3 < 1) { val = t1 + (t2 - t1) * 6 * t3; }
      else if (2 * t3 < 1) { val = t2; }
      else if (3 * t3 < 2) { val = t1 + (t2 - t1) * (2 / 3 - t3) * 6; }
      else { val = t1; }

      rgb[i] = Math.round(val * 255);
    }
    return rgb;
  }

  getHSLFromHex(hex) {
    const rgb = this.getRGBFromHex(hex);
    return this.getHSLFromRGB(rgb);
  }

  getHexFromHSL(hsl) {
    const rgb = this.getRGBFromHSL(hsl);
    return this.getHexFromRGB(rgb);
  }

  getRGBFromHSV(hsv) {
    const h = hsv[0] / 60;
    const s = hsv[1] / 100;
    let v = hsv[2] / 100;
    const hi = Math.floor(h) % 6;

    const f = h - Math.floor(h);
    let p = 255 * v * (1 - s);
    let q = 255 * v * (1 - s * f);
    let t = 255 * v * (1 - s * (1 - f));
    v *= 255;

    v = Math.round(v);
    t = Math.round(t);
    p = Math.round(p);
    q = Math.round(q);

    if (hi === 0) { return [v, t, p]; }
    else if (hi === 1) { return [q, v, p]; }
    else if (hi === 2) { return [p, v, t]; }
    else if (hi === 3) { return [p, q, v]; }
    else if (hi === 4) { return [t, p, v]; }
    else if (hi === 5) { return [v, p, q]; }
  }

  getHSVFromRGB(rgb) {
    const r = rgb[0];
    const g = rgb[1];
    const b = rgb[2];
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    const delta = max - min;
    let h;
    const s = max === 0 ? 0 : ((delta / max) * 1000) / 10;
    const v = ((max / 255) * 1000) / 10;

    if (max === min) { h = 0; }
    else if (r === max) { h = (g - b) / delta; }
    else if (g === max) { h = 2 + (b - r) / delta; }
    else if (b === max) { h = 4 + (r - g) / delta; }
    h = Math.min(h * 60, 360);
    if (h < 0) { h += 360; }

    return [Math.round(h), Math.round(s), Math.round(v)];
  }

  isDarkColor(rgb) {
    if (rgb) {
      return (
        Math.round(
          (parseInt(rgb[0], 10) * 299 +
            parseInt(rgb[1], 10) * 587 +
            parseInt(rgb[2], 10) * 114) /
          1000
        ) <= 140
      );
    }
    return (
      Math.round(
        (parseInt(this.red, 10) * 299 +
          parseInt(this.green, 10) * 587 +
          parseInt(this.blue, 10) * 114) /
        1000
      ) <= 140
    );
  }

  setNegativeColor(rgb) {
    if (!rgb) { rgb = this.rgb; }
    const negative = this.getNegativeColor(rgb);
    this.setColorFromRGB(negative);
    return negative;
  }

  getNegativeColor(rgb) {
    var negative = [];
    for (let i = 0; i < 3; i++) {
      negative[i] = 255 - rgb[i];
    }
    return negative;
  }

  setRedComplementary(rgb) {
    this.setColorFromRGB(this.getRedComplementary(rgb));
  }

  getRedComplementary(rgb) {
    if (!rgb) { rgb = this.rgb; }
    return [rgb[0], rgb[2], rgb[1]];
  }

  setGreenComplementary(rgb) {
    this.setColorFromRGB(this.getGreenComplementary(rgb));
  }

  getGreenComplementary(rgb) {
    if (!rgb) { rgb = this.rgb; }
    return [rgb[2], rgb[1], rgb[0]];
  }

  setBlueComplementary(rgb) {
    this.setColorFromRGB(this.getBlueComplementary(rgb));
  }

  getBlueComplementary(rgb) {
    if (!rgb) { rgb = this.rgb; }
    return [rgb[1], rgb[0], rgb[2]];
  }

  setGrayscale(rgb) {
    const gray = this.getGrayscale(rgb);
    this.setColorFromRGB(gray);
    return gray;
  }

  getGrayscale(rgb) {
    var gray = parseInt(rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11, 10);
    if (gray < 0) { gray = 0; }
    if (gray > 255) { gray = 255; }
    return [gray, gray, gray];
  }

  setLightnessFromHSL(light, hsl) {
    const rgb = this.getLightnessFromHSL(light, hsl);
    this.setColorFromRGB(rgb);
    return rgb;
  }

  getLightnessFromHSL(light, hsl) {
    hsl = [hsl[0], hsl[1], hsl[2] + light];
    let rgb = this.getRGBFromHSL(hsl);
    for (let i = 0; i < rgb.length; i++) {
      if (rgb[i] < 0) { rgb[i] = 0; }
      if (rgb[i] > 255) { rgb[i] = 255; }
    }
    return rgb;
  }

  setLightnessFromRGB(light, rgb) {
    rgb = this.getLightnessFromRGB(light, rgb);
    this.setColorFromRGB(rgb);
    return rgb;
  }

  getLightnessFromRGB(light, rgb) {
    let hsl = this.getHSLFromRGB(rgb);
    return this.getLightnessFromHSL(light, hsl);
  }

  setLightnessFromHex(light, hex) {
    hex = this.getLightnessFromHex(light, hex);
    this.setColorFromHex(hex);
    return hex;
  }

  getLightnessFromHex(light, hex) {
    let hsl = this.getHSLFromHex(hex);
    return this.getHexFromRGB(this.getLightnessFromHSL(light, hsl));
  }

  setChangeHueFromHSL(degrees, hsl) {
    hsl = this.getChangeHueFromHSL(degrees, hsl);
    this.setColorFromHSL(hsl);
    return hsl;
  }

  getChangeHueFromHSL(degrees, hsl) {
    hsl[0] += degrees;
    if (hsl[0] > 360) { hsl[0] -= 360; }
    else if (hsl[0] < 0) { hsl[0] += 360; }
    return this.getRGBFromHSL(hsl);
  }

  setChangeHueFromRGB(degrees, rgb) {
    rgb = this.getChangeHueFromRGB(degrees, rgb);
    this.setColorFromRGB(rgb);
    return rgb;
  }

  getChangeHueFromRGB(degrees, rgb) {
    const hsl = this.getHSLFromRGB(rgb);
    hsl[0] += degrees;
    if (hsl[0] > 360) { hsl[0] -= 360; }
    else if (hsl[0] < 0) { hsl[0] += 360; }
    return this.getRGBFromHSL(hsl);
  }

  setChangeHueFromHex(degrees, hex) {
    hex = this.getChangeHueFromHex(degrees, hex);
    this.setColorFromHex(hex);
    return hex;
  }

  getChangeHueFromHex(degrees, hex) {
    const hsl = this.getHSLFromHex(hex);
    hsl[0] += degrees;
    if (hsl[0] > 360) { hsl[0] -= 360; }
    else if (hsl[0] < 0) { hsl[0] += 360; }
    return this.getHexFromHSL(hsl);
  }

  getNaturalFromRGB(percent, rgb) {
    let hsv = this.getHSVFromRGB(rgb);
    let h = hsv[0];
    let s = hsv[1];
    let v = hsv[2];

    h += 0.8 * percent;
    if (h > 360) { h -= 360; }
    else if (h < 0) { h += 360; }

    if (hsv[0] > 240 || hsv[0] < 60) {
      if (percent > 0) { s -= 0.7 * percent; }
      else { s -= 0.7 * percent; }
      if (s > 100) { s = 100; }
      else if (s < 0) { s = 0; }

      if (percent < 0) { v += 0.4 * percent; }
      else { v += 0.3 * percent; }
      if (v > 100) { v = 100; }
      else if (v < 0) { v = 0; }
    } else {
      if (percent > 0) { s += 0.7 * percent; }
      else { s += 0.7 * percent; }
      if (s > 100) { s = 100; }
      else if (s < 0) { s = 0; }

      if (percent < 0) { v -= 0.4 * percent; }
      else { v -= 0.3 * percent; }
      if (v > 100) { v = 100; }
      else if (v < 0) { v = 0; }
    }

    return this.getRGBFromHSV([h, s, v]);
  }
}
