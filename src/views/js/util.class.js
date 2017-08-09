'use strict'

class ContextMenu {
  constructor () {
    this.window = remote.getCurrentWindow()
  }

  openMenu (type) {
    let menu
    switch (type) {
      case 'colorpickerMenu': menu = remote.Menu.buildFromTemplate(this.colorpickerMenu()); break
    }
    menu.popup(this.window)
  }

  colorpickerMenu () {
    return [
      { label: 'Pin to Foreground', accelerator: 'CmdOrCtrl+F', click: () => togglePin() },
      { type: 'separator' },
      { label: 'Save Color', accelerator: 'CmdOrCtrl+S', click: () => cb.saveColor(cp.hex) },
      { label: 'Copy Hex Code', accelerator: 'CmdOrCtrl+W', click: () => cp.copyHex() },
      { label: 'Copy RGB Code', visible: !cp.activeAlpha, accelerator: 'Shift+CmdOrCtrl+W', click: () => cp.copyRGB() },
      { label: 'Copy RGBA Code', visible: cp.activeAlpha, accelerator: 'Shift+CmdOrCtrl+W', click: () => cp.copyRGBA() },
      { type: 'separator' },
      { label: 'Pick Color', accelerator: 'CmdOrCtrl+P', click: () => picker.init() },
      { label: 'Toggle Shading', accelerator: 'CmdOrCtrl+T', click: () => toggleShading() },
      { label: 'Toggle Opacity', accelerator: 'CmdOrCtrl+O', click: () => toggleOpacity() },
      { type: 'separator' },
      { label: 'Set Random Color', accelerator: 'CmdOrCtrl+M', click: () => toggleRandom() },
      { label: 'set Negative Color', accelerator: 'CmdOrCtrl+N', click: () => cp.setNegativeColor() }
    ]
  }

}
