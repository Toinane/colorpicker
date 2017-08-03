'use strict';

class Color {

  constructor(r, g, b) {
    this.setColorFromIndividual(r, g, b);
  }

  setColorFromIndividual(r, g, b) {
    this.red = parseInt(r);
    this.green = parseInt(g);
    this.blue = parseInt(b);
    this.rgb = [r, g, b];
    this.hex = this.getHexFromRGB(this.rgb);
    this.hsl = this.getHSLFromRGB(this.rgb);
    return true;
  }

  setColorFromArray(rgb) {
    this.setColorFromIndividual(rgb[0], rgb[1], rgb[2]);
    return true;
  }

  setColorFromHex(hex) {
    const rgb = this.getRGBFromHex(hex);
    this.setColorFromArray(rgb);
    return true;
  }

  setColorFromHSL(hsl) {
    const rgb = this.getRGBFromHSL(hsl);
    this.setColorFromArray(rgb);
    return true;
  }

  getCSSFromRGB(rgb) {
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  }

  getRGBFromIndividual(r, g, b) {
    return [r, g, b];
  }

  getHexFromRGB(rgb) {
    let hex = [Number(rgb[0]).toString(16), Number(rgb[1]).toString(16), Number(rgb[2]).toString(16)];
    for(let i = 0; i<3; i++){
      if(hex[i] < 10 || hex[i].length === 1){ hex[i] = '0'+hex[i]; }
    }
    return '#'+hex.join('').toUpperCase();
  }

  getRGBFromHex(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	  let num = parseInt(hex, 16);
	  return [num >> 16, num >> 8 & 255, num & 255];
  }

  getHSLFromRGB(rgb) {
    let r = rgb[0]/255, g = rgb[1]/255, b = rgb[2]/255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h, s, l];
  }

  getRGBFromHSL(hsl) {
    let r, g, b, h = hsl[0], s = hsl[1], l = hsl[2];
    if (s === 0) { r = g = b = l; } // achromatic
    else {
      let hue2rgb = (p, q, t) => {
        if(t < 0) t += 1;
        if(t > 1) t -= 1;
        if(t < 1/6) return p + (q - p) * 6 * t;
        if(t < 1/2) return q;
        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      }
      let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      let p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  getHSLFromHex(hex) {
    const rgb = this.getRGBFromHex(hex);
    return this.getRGBFromHSL(rgb);
  }

  getHexFromHSL(hsl) {
    const rgb = this.getRGBFromHSL(hsl);
    return this.getHexFromRGB(rgb);
  }

  isDarkColor(rgb) {
    if (rgb) return Math.round((
      parseInt(rgb[0]) * 299 +
      parseInt(rgb[1]) * 587 +
      parseInt(rgb[2]) * 114) / 1000
    ) <= 140;
    return Math.round((
      parseInt(this.red) * 299 +
      parseInt(this.green) * 587 +
      parseInt(this.blue) * 114) / 1000
    ) <= 140;
  }

  setNegativeColor(rgb) {
    const negative = this.getNegativeColor(rgb);
    this.setColorFromArray(negative);
    return negative;
  }

  getNegativeColor(rgb) {
    var negative = [];
    for(let i = 0; i < 3; i++){
      negative[i] = 255 - rgb[i];
    }
    return negative;
  }

  setGrayscale(rgb) {
    const gray = this.getGrayscale(rgb);
    this.setColorFromArray(gray);
    return gray;
  }

  getGrayscale(setColor) {
    var gray = parseInt(this.red * 0.3 + this.green * 0.59 + this.blue * 0.11);
    if(gray < 0){gray = 0;}
    if(gray > 255){gray = 255;}
    return [gray, gray, gray];
  }

  setLightness(light, hsl) {
    const rgb = this.getLightness(light, hsl);
    this.setColorFromArray(rgb);
    return rgb;
  }

  getLightness(light, hsl) {
    hsl = [hsl[0], hsl[1], (hsl[2]+light)];
    const lightness = this.getRGBFromHSL(hsl);
    for(let i = 0; i < lightness.length; i++){
      if(lightness[i] < 0){lightness[i] = 0;}
      if(lightness[i] > 255){lightness[i] = 255;}
    }
    return lightness;
  }

  setRotatedColor(degrees, hsl) {
    const rgb = this.getRotatedColor(degrees, hsl);
    this.setColorFromArray(rgb);
    return rgb;
  }

  getRotatedColor(degrees, hsl){
    let hue = hsl[0];
    hue = (hue + degrees) % 360;
    hue = hue < 0 ? 360 + hue : hue;
    hue = hue * 0.01;
    return this.getRGBFromHSL([hue, hsl[1], hsl[2]]);
  }

}
