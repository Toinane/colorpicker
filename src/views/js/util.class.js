'use strict'

class ContextMenu {
  constructor () {
    this.window = remote.getCurrentWindow()
  }

  openMenu (type) {
    let menu
    switch (type) {
      case 'colorpickerMenu': menu = remote.Menu.buildFromTemplate(this.colorpickerMenu()); break
      case 'colorMenu': menu = remote.Menu.buildFromTemplate(this.colorMenu()); break
      case 'categoryMenu': menu = remote.Menu.buildFromTemplate(this.categoryMenu()); break
    }
    menu.popup(this.window)
  }

  colorpickerMenu () {
    return [
      { label: 'Pin to Foreground', accelerator: 'CmdOrCtrl+F', click: () => togglePin() },
      { type: 'separator' },
      { label: 'Save Color', accelerator: 'CmdOrCtrl+S', click: () => ipcRenderer.send('saveColor', cp.hex) },
      { label: 'Copy Hex Code', accelerator: 'CmdOrCtrl+W', click: () => cp.copyHex() },
      { label: 'Copy RGB Code', visible: !cp.activeAlpha, accelerator: 'Shift+CmdOrCtrl+W', click: () => cp.copyRGB() },
      { label: 'Copy RGBA Code', visible: cp.activeAlpha, accelerator: 'Shift+CmdOrCtrl+W', click: () => cp.copyRGBA() },
      { type: 'separator' },
      { label: 'Pick Color', accelerator: 'CmdOrCtrl+P', click: () => picker.init() },
      { label: 'Get Clipboard\'s Colors', accelerator: 'Shift+CmdOrCtrl+V', click: () => applyColor() },
      { label: 'Toggle Shading', accelerator: 'CmdOrCtrl+T', click: () => toggleShading() },
      { label: 'Toggle Opacity', accelerator: 'CmdOrCtrl+O', click: () => toggleOpacity() },
      { type: 'separator' },
      { label: 'Set Random Color', accelerator: 'CmdOrCtrl+M', click: () => toggleRandom() },
      { label: 'set Negative Color', accelerator: 'CmdOrCtrl+N', click: () => cp.setNegativeColor() },
      { type: 'separator' },
      { label: 'Preferences', accelerator: 'CmdOrCtrl+,', click: () => ipcRenderer.send('showPreferences') }
    ]
  }

  colorMenu () {
    return [
      { label: 'Delete', click: () => deleteColor() },
    ]
  }

  categoryMenu () {
    return [
      { label: 'Delete', click: () => deleteCategory() },
    ]
  }

  initButtonsType (type, name) {
    const appButtons = document.querySelector('#app_buttons')
    const minimize = document.querySelector('#minimize')
    const maximize = document.querySelector('#maximize')
    const close = document.querySelector('#close')
    switch (type) {
      case 'windows':
        appButtons.classList = 'windows'
        minimize.classList = 'fa fa-window-minimize'
        maximize.classList = 'fa fa-square'
        close.classList = 'fa fa-times'
        break
      case 'linux':
        appButtons.classList = 'linux'
        minimize.classList = 'fa fa-minus'
        maximize.classList = 'fa fa-sort'
        close.classList = 'fa fa-times-circle'
        break
      default:
        appButtons.classList = 'darwin'
        minimize.classList = 'fa fa-circle'
        maximize.classList = 'fa fa-circle'
        close.classList = 'fa fa-circle'
    }

    document.querySelector('#close').onclick = () => ipcRenderer.send(`close-${name}`)
    document.querySelector('#minimize').onclick = () => ipcRenderer.send(`minimize-${name}`)
    document.querySelector('#maximize').onclick = function () {
      ipcRenderer.send(`maximize-${name}`)
    }
  }

}
