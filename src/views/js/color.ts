'use strict'

import { ipcRenderer, remote, clipboard } from 'electron';

type RGB = [number, number, number];
type RGBA = [number, number, number, number];
type HSL = [number, number, number];
type HSV = [number, number, number];
type Hexadecimal = string;
type Alpha = number;

/**
 * Color Class
 * 
 * @abstract
 * @class Color
 */
export default abstract class Color {

  protected red: number;
  protected green: number;
  protected blue: number;
  protected hexadecimal: Hexadecimal;
  protected rgb: RGB;
  protected rgba: RGBA;
  protected hsl: HSL;
  protected hsv: HSV;
  protected alpha: Alpha = 1;

  /**
   * Set new color with RGB format
   * 
   * @protected
   * @param {RGB} rgb 
   * @returns {Color} Color
   */
  protected setColor(rgb: RGB): Color {
    this.red = rgb[0];
    this.green = rgb[1];
    this.blue = rgb[2];
    this.rgb = rgb;
    this.rgba = [this.red, this.green, this.blue, this.alpha];
    this.hexadecimal = this.convertRGBtoHex(rgb);
    this.hsl = this.convertRGBtoHSL(rgb);
    this.hsv = this.convertRGBtoHSV(rgb);

    return this;
  }

  /**
   * Set new color with hexadecimal format
   * 
   * @protected
   * @param {Hexadecimal} hexadecimal 
   * @returns {Color} Color
   */
  protected setColorWithHex(hexadecimal: Hexadecimal): Color {
    const rgb = this.convertHextoRGB(hexadecimal);
    this.setColor(rgb);

    return this;
  }

  /**
   * Set new color with HSL format
   * 
   * @protected
   * @param {HSL} hsl 
   * @returns {Color} Color
   */
  protected setColorWithHSL(hsl: HSL): Color {
    const rgb = this.convertHSLtoRGB(hsl);
    this.setColor(rgb);

    return this;
  }

  /**
   * Convert RGB format to hexadecimal format
   * 
   * @protected
   * @param {RGB} rgb 
   * @returns {Hexadecimal} Hexadecimal
   */
  protected convertRGBtoHex(rgb: RGB): Hexadecimal {
    let hex: string[] = [
      rgb[0].toString(16),
      rgb[1].toString(16),
      rgb[2].toString(16)
    ];

    for (let i = 0; i < 3; i++) {
      if (hex[i].length === 1) hex[i] = '0' + hex[i];
    }

    return '#' + hex.join('').toUpperCase();
  }

  /**
   * Convert RGB format to HSL format
   * 
   * @protected
   * @param {RGB} rgb 
   * @returns {HSL} HSL
   */
  protected convertRGBtoHSL(rgb: RGB): HSL {
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    const delta = max - min;
    let h = 0, s, l;

    if (r === max) h = (g - b) / delta;
    else if (g === max) h = 2 + (b - r) / delta;
    else if (b === max) h = 4 + (r - g) / delta;

    h = Math.min(h * 60, 360);
    if (h < 0) h += 360;
    l = (min + max) / 2;

    if (max === min) s = 0;
    else if (l <= 0.5) s = delta / (max + min);
    else s = delta / (2 - max - min);

    return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
  }

  /**
   * Convert RGB format to HSV format
   * 
   * @protected
   * @param {RGB} rgb 
   * @returns {HSV} HSV
   */
  protected convertRGBtoHSV(rgb: RGB): HSV {
    const r = rgb[0];
    const g = rgb[1];
    const b = rgb[2];
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    const delta = max - min;
    const s = max === 0 ? 0 : (delta / max * 1000) / 10;
    const v = ((max / 255) * 1000) / 10;

    let h;

    if (max === min) h = 0;
    else if (r === max) h = (g - b) / delta;
    else if (g === max) h = 2 + ((b - r) / delta);
    else if (b === max) h = 4 + ((r - g) / delta);
    h = Math.min(h * 60, 360);
    if (h < 0) h += 360;

    return [Math.round(h), Math.round(s), Math.round(v)];
  }

  /**
   * Convert hexadecimal format to RGB format
   * 
   * @protected
   * @param {Hexadecimal} hex 
   * @returns {RGB} RGB
   */
  protected convertHextoRGB(hex: Hexadecimal): RGB {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    let num = parseInt(hex, 16);

    return [num >> 16, num >> 8 & 255, num & 255];
  }

  /**
   * Convert hexadecimal format to HSL format
   * 
   * @protected
   * @param {Hexadecimal} hex 
   * @returns {HSL} HSL
   */
  protected convertHextoHSL(hex: Hexadecimal): HSL {
    const rgb = this.convertHextoRGB(hex);

    return this.convertRGBtoHSL(rgb);
  }

  /**
   * Convert HSL format to RGB format
   * 
   * @protected
   * @param {HSL} hsl 
   * @returns {RGB} RGB
   */
  protected convertHSLtoRGB(hsl: HSL): RGB {
    const h = hsl[0] / 360;
    const s = hsl[1] / 100;
    const l = hsl[2] / 100;
    let t1, t2, t3, rgb, val;

    if (s === 0) {
      val = l * 255;
      return [val, val, val];
    }
    if (l < 0.5) t2 = l * (1 + s);
    else t2 = l + s - l * s;

    t1 = 2 * l - t2;
    rgb = [0, 0, 0];

    for (let i = 0; i < 3; i++) {
      t3 = h + 1 / 3 * -(i - 1);
      if (t3 < 0) t3++;
      if (t3 > 1) t3--;
      if (6 * t3 < 1) val = t1 + (t2 - t1) * 6 * t3;
      else if (2 * t3 < 1) val = t2;
      else if (3 * t3 < 2) val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
      else val = t1;

      rgb[i] = Math.round(val * 255);
    }

    return rgb;
  }

  /**
   * Convert HSL format to hexadecimal format
   * 
   * @protected
   * @param {HSL} hsl 
   * @returns {Hexadecimal} Hexadecimal
   */
  protected convertHSLtoHex(hsl: HSL): Hexadecimal {
    const rgb = this.convertHSLtoRGB(hsl);

    return this.convertRGBtoHex(rgb);
  }

  /**
   * Convert HSV format to RGB format
   * 
   * @protected
   * @param {HSV} hsv 
   * @returns {RGB} 
   */
  protected convertHSVtoRGB(hsv: HSV): RGB {
    const h = hsv[0] / 60;
    const s = hsv[1] / 100;
    let v = hsv[2] / 100;
    const hi = Math.floor(h) % 6;

    const f = h - Math.floor(h);
    let p = 255 * v * (1 - s);
    let q = 255 * v * (1 - (s * f));
    let t = 255 * v * (1 - (s * (1 - f)));
    v *= 255;

    v = Math.round(v);
    t = Math.round(t);
    p = Math.round(p);
    q = Math.round(q);

    if (hi === 0) return [v, t, p];
    else if (hi === 1) return [q, v, p];
    else if (hi === 2) return [p, v, t];
    else if (hi === 3) return [p, q, v];
    else if (hi === 4) return [t, p, v];
    else if (hi === 5) return [v, p, q];
  }

  /**
   * Get CSS format for the current color
   * 
   * @protected
   * @param {boolean} [hexadecimalFormat=false] 
   * @returns {string} string
   */
  protected getCSS(hexadecimalFormat: boolean = false): string {
    if (hexadecimalFormat) return `#${this.hexadecimal}`;

    return `rgb(${this.red}, ${this.green}, ${this.blue})`;
  }

  /**
   * Get CSS format for the current color in RGBA
   * 
   * @protected
   * @param {boolean} [hexadecimalFormat=false] 
   * @returns {string} string
   */
  protected getRGBACSS(): string {

    return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha})`;
  }

  /**
   * Get red complementary color for the current color
   * 
   * @protected
   * @returns {RGB} RGB
   */
  protected getRedComplementary(rgb?: RGB): RGB {
    if(rgb) return [rgb[0], rgb[2], rgb[1]];

    return [this.red, this.blue, this.green];
  }

  /**
   * Get green complementary color for the current color
   * 
   * @protected
   * @returns {RGB} RGB
   */
  protected getGreenComplementary(rgb?: RGB): RGB {
    if(rgb) return [rgb[2], rgb[1], rgb[0]];

    return [this.blue, this.green, this.red];
  }

  /**
   * Get blue complementary color for the current color
   * 
   * @protected
   * @returns {RGB} RGB
   */
  protected getBlueComplementary(rgb?: RGB): RGB {
    if(rgb) return [rgb[1], rgb[0], rgb[2]];

    return [this.green, this.red, this.blue];
  }

  /**
   * Get negative color for the current color
   * 
   * @protected
   * @param {boolean} [setColor=false]
   * @returns {RGB} RGB
   */
  protected getNegativeColor(setColor: boolean = false): RGB {
    const negative: RGB = [
      255 - this.red,
      255 - this.green,
      255 - this.blue
    ];

    if(setColor) this.setColor(negative);

    return negative;
  }

  /**
   * Get natural color for the current color
   * 
   * @protected
   * @param {any} percent
   * @param {boolean} [setColor=false]
   * @returns 
   */
  protected getNaturalColor(percent: number, setColor: boolean = false): RGB {
    let hsv = this.convertRGBtoHSV(this.rgb)
    let h = hsv[0];
    let s = hsv[1];
    let v = hsv[2];

    h += 0.8 * percent;
    if (h > 360) h -= 360;
    else if (h < 0) h += 360;

    if (hsv[0] > 240 || hsv[0] < 60) {
      if (percent > 0) s -= 0.7 * percent;
      else s -= 0.7 * percent;
      if (s > 100) s = 100;
      else if (s < 0) s = 0;

      if (percent < 0) v += 0.4 * percent;
      else v += 0.3 * percent;
      if (v > 100) v = 100;
      else if (v < 0) v = 0;
    } else {
      if (percent > 0) s += 0.7 * percent;
      else s += 0.7 * percent;
      if (s > 100) s = 100;
      else if (s < 0) s = 0;

      if (percent < 0) v -= 0.4 * percent;
      else v -= 0.3 * percent;
      if (v > 100) v = 100;
      else if (v < 0) v = 0;
    }

    let rgb: RGB = this.convertHSVtoRGB([h, s, v]);
    if(setColor) this.setColor(rgb);

    return rgb;
  }

  /**
   * Get gray color for the current color
   * 
   * @protected
   * @returns {RGB} RGB 
   */
  protected getGrayColor(setColor: boolean = false): RGB {
    var gray = this.red * 0.3 + this.green * 0.59 + this.blue * 0.11;
    if (gray < 0) gray = 0
    if (gray > 255) gray = 255

    if(setColor) this.setColor([gray, gray, gray]);

    return [gray, gray, gray];
  }

  /**
   * Get color with new lightness value for the current color
   * 
   * @protected
   * @param {number} light
   * @param {boolean} [setColor=false]
   * @returns {RGB} RGB
   */
  protected getRGBwithLightness(light: number, setColor: boolean = false, rgb?: RGB): RGB {
    const hsl: HSL = (rgb) ? this.convertRGBtoHSL(rgb) : [this.hsl[0], this.hsl[1], (this.hsl[2] + light)];
    rgb = this.convertHSLtoRGB(hsl);

    for (let i = 0; i < rgb.length; i++) {
      if (rgb[i] < 0) rgb[i] = 0;
      if (rgb[i] > 255) rgb[i] = 255;
    }

    if(setColor) this.setColor(rgb);

    return rgb;
  }

  /**
   * Get color with new hue value for the current color
   * 
   * @protected
   * @param {any} degrees 
   * @param {boolean} [setColor=false]
   * @returns 
   */
  protected getRGBwithHue(degrees: number, setColor: boolean = false): RGB {
    let hsl = this.hsl;

    hsl[0] += degrees;
    if (hsl[0] > 360) hsl[0] -= 360;
    else if (hsl[0] < 0) hsl[0] += 360;

    let rgb: RGB = this.convertHSLtoRGB(hsl);
    if(setColor) this.setColor(rgb);

    return rgb;
  }

  /**
 * If current color is a dark color
 * 
 * @protected
 * @returns {boolean} boolean
 */
  protected isDarkColor(): boolean {

    return Math.round((
      this.red * 299 +
      this.green * 587 +
      this.blue * 114) / 1000
    ) <= 140;
  }
}
