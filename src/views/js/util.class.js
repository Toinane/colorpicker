'use strict';

let cm;

class ContextMenu {

  constructor() {
    this.window = remote.getCurrentWindow();
  }

  openMenu(type) {
    let menu;
    switch (type) {
      case 'colorpickerMenu': menu = remote.Menu.buildFromTemplate(this.colorpickerMenu()); break;
    }
    menu.popup(this.window);
  }

  colorpickerMenu() {


    return [
      {label: 'Save color' , accelerator: 'CmdOrCtrl+S', click: () => this.save(), active: false},
      {type: 'separator'},
      {label: 'Copy Hex code', accelerator: 'CmdOrCtrl+Space', click: () => this.copyHex()},
      {label: 'Copy RGB code', visible: !cp.activeAlpha, accelerator: 'CmdOrCtrl+Shift+Space', click: () => this.copyRGB()},
      {label: 'Copy RGBA code', visible: cp.activeAlpha, accelerator: 'CmdOrCtrl+Shift+Space', click: () => this.copyRGB()},
      {type: 'separator'},
      {label: 'set Negative Color', accelerator: 'CmdOrCtrl+N', click: () => this.setNegative()},
      {type: 'separator'},
      {label: 'toogle devtools', role: 'toggledevtools'}
    ];
  }

  save() {
    console.log('save');
  }

  copyHex() {
    console.log('copy hex');
  }

  copyRGB() {
    if (cp.activeAlpha) console.log('copy rgba');
    else console.log('copy rgb');
  }

  setNegative() {
    
  }

}
