'use strict'

import settings from 'electron-settings';
import {dialog} from 'electron';

enum platform {
  WINDOWS,
  DARWIN,
  LINUX
}

export default class Storage {
  private template:object = {
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
  };
  private defaultSettings:object = {
    colorpicker: {
      tools: ['top', 'picker', 'tags', 'shade', 'opacity', 'settings'],
      size: { width: 440, height: 150 },
      buttonsPosition: this.template[this.getPlatform()].buttonsPosition,
      buttonsType: this.template[this.getPlatform()].buttonsType,
      lastColor: '#00AEEF',
      history: [],
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
  };

  constructor() {
    if (!settings.has('cp.colorpicker')) {
      this.reset();
    }
  }

  private getPlatform():platform {
    switch (process.platform) {
      case 'darwin': return platform.DARWIN
      case 'win32': return platform.WINDOWS
      case 'linux': return platform.LINUX
      case 'freebsd': return platform.LINUX
      case 'sunos': return platform.LINUX
      default: return platform.DARWIN
    }
  }

  private save(data:any, key:string, name:string = 'colorpicker'):void {
    settings.set(`cp.${name}.${key}`, data);
  }

  public get(key:string, name:string = 'colorpicker'):any {
    return settings.get(`cp.${name}.${key}`) || {};
  }

  public reset():void {
    settings.set('cp', this.defaultSettings);
  }
  
};