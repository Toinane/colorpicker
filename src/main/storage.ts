import * as settings from 'electron-settings'

interface JsonObject {
  [x: string]: JsonValue
}

interface JsonArray extends Array<JsonValue> {}

type JsonValue = string | number | boolean | null | JsonArray | JsonObject

enum platform {
  WINDOWS = 'WINDOWS',
  DARWIN = 'DARWIN',
  LINUX = 'LINUX'
}

export default class Storage {

  private defaultSettings!: JsonValue

  private defaultTemplate: object = {
    WINDOWS: {
      buttonsPosition: 'right',
      buttonsType: 'windows'
    },
    DARWIN: {
      buttonsPosition: 'left',
      buttonsType: 'osx'
    },
    LINUX: {
      buttonsPosition: 'right',
      buttonsType: 'linux'
    }
  }

  constructor () {
    if (!settings.has('cp.colorpicker')) {
      this.reset()
    }
  }

  public has (key: string, name: string = 'colorpicker'): Boolean {
    return settings.has(`cp.${name}.${key}`)
  }

  public set (data: any, key: string, name: string = 'colorpicker'): void {
    settings.set(`cp.${name}.${key}`, data)
  }

  public get (key: string, name: string = 'colorpicker'): any {
    return settings.get(`cp.${name}.${key}`) || {}
  }

  public reset (): void {
    console.log(this.getPlatform())

    this.defaultSettings = {
      colorpicker: {
        tools: ['top', 'picker', 'tags', 'shade', 'opacity', 'settings'],
        size: { width: 440, height: 150 },
        buttonsPosition: this.defaultTemplate[this.getPlatform()].buttonsPosition,
        buttonsType: this.defaultTemplate[this.getPlatform()].buttonsType,
        lastColor: '#00AEEF',
        colorfullApp: false
      },
      colorsbook: {
        colors: {
          'pastel': [
            '#7E93C8',
            '#8FC1E2',
            '#AFBBE3'
          ]
        }
      },
      picker: {
        realTime: true
      }
    }

    settings.set('cp', this.defaultSettings)
  }

  private getPlatform (): platform {
    switch (process.platform) {
    case 'darwin': return platform.DARWIN
    case 'win32': return platform.WINDOWS
    case 'linux': return platform.LINUX
    case 'freebsd': return platform.LINUX
    case 'sunos': return platform.LINUX
    default: return platform.LINUX
    }
  }
}
