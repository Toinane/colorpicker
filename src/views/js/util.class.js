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
      { label: 'Save Color', accelerator: 'CmdOrCtrl+S', click: () => this.save(), active: false },
      { type: 'separator' },
      { label: 'Copy Hex Code', accelerator: 'CmdOrCtrl+W', click: () => this.copyHex() },
      { label: 'Copy RGB Code', visible: !cp.activeAlpha, accelerator: 'Shift+CmdOrCtrl+W', click: () => this.copyRGB() },
      { label: 'Copy RGBA Code', visible: cp.activeAlpha, accelerator: 'Shift+CmdOrCtrl+W', click: () => this.copyRGB() },
      { type: 'separator' },
      { label: 'set Negative Color', accelerator: 'CmdOrCtrl+N', click: () => this.setNegative() }
    ]
  }

  save () {
    console.log('save')
  }

  copyHex () {
    console.log('copy hex')
  }

  copyRGB () {
    if (cp.activeAlpha) console.log('copy rgba')
    else console.log('copy rgb')
  }

  setNegative () {

  }
}
