/// <reference types="node" />

declare namespace Colorpicker {
    class ColorpickerApp {

    }

    class Storage {
        has(key:string, name?:string):boolean
        set(data:any, key:string, name?:string):void
        get(key:string, name?:string):any
        reset():void
    }

    class ColorpickerTouchBar {
        getTouchBar():Electron.TouchBar
    }

    class Window {
        getWindows():object
    }

    class ColorpickerWindow {
        showWindow(forceInit?:boolean):void
        getWindow():Electron.BrowserWindow 
    }

    class ColorbookWindow {
        showWindow(forceInit?:boolean):void
        getWindow():Electron.BrowserWindow 
    }

    class PickerWindow {
        showWindow(forceInit?:boolean):void
        getWindow():Electron.BrowserWindow 
    }

    class PreviewWindow {
        showWindow(forceInit?:boolean):void
        getWindow():Electron.BrowserWindow 
    }

    class SettingsWindow {
        showWindow(forceInit?:boolean):void
        getWindow():Electron.BrowserWindow 
    }
}