/// <reference types="node" />

type RGB = [number, number, number];
type HSL = [number, number, number];
type HSV = [number, number, number];
type Hexadecimal = string;

declare namespace Colorpicker {
    abstract class Colorpicker {

    }

    class Storage {
        has(key: string, name?: string): boolean
        set(data: any, key: string, name?: string): void
        get(key: string, name?: string): any
        reset(): void
    }

    class ColorpickerTouchBar {
        getTouchBar(): Electron.TouchBar
    }

    class ColorpickerWindow {
        showWindow(forceInit?: boolean): void
        getWindow(): Electron.BrowserWindow 
    }

    class ColorbookWindow {
        showWindow(forceInit?: boolean): void
        getWindow(): Electron.BrowserWindow 
    }

    class PickerWindow {
        showWindow(forceInit?: boolean): void
        getWindow(): Electron.BrowserWindow 
    }

    class PreviewWindow {
        showWindow(forceInit?: boolean): void
        getWindow(): Electron.BrowserWindow 
    }

    class SettingsWindow {
        showWindow(forceInit?: boolean): void
        getWindow(): Electron.BrowserWindow 
    }

    abstract class Color {
        setColor(rgb: RGB): Color
        setColorWithHex(hexadecimal: Hexadecimal): Color
        setColorWithHSL(hsl: HSL): Color
        convertRGBtoHex(rgb: RGB): Hexadecimal
        convertRGBtoHSL(rgb: RGB): HSL
        convertRGBtoHSV(rgb: RGB): HSV
        convertHextoRGB(hex: Hexadecimal): RGB
        convertHextoHSL(hex: Hexadecimal): HSL
        convertHSLtoRGB(hsl: HSL): RGB
        convertHSLtoHex(hsl: HSL): Hexadecimal
        convertHSVtoRGB(hsv: HSV): RGB
        getRed(): number
        getGreen(): number
        getBlue(): number
        getRGB(): RGB
        getHex(): Hexadecimal
        getHSL(): HSL
        getHSV(): HSV
        getCSS(hexadecimalFormat?: boolean): string
        getNegativeColor(): RGB
        getNaturalColor(percent: number): RGB
        getRedComplementary(): RGB
        getGreenComplementary(): RGB
        getBlueComplementary(): RGB
        getGrayColor(): RGB
        getRGBwithLightness(light: number): RGB
        getRGBwithHue(degrees: number): RGB
        isDarkColor(): boolean
    }

    class ColorpickerApp {
        
    }
}