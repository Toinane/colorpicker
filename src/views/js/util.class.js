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
      {label: 'Save color' , accelerator: "CmdOrCtrl+S", click: () => console.log(cp)},
      {type: 'separator'},
      {label: 'Copy Hex code'},
      {label: 'Copy RGB code', visible: !cp.activeAlpha},
      {label: 'Copy RGBA code', visible: cp.activeAlpha},
      {type: 'separator'},
      {label: 'set Negative Color'},
      {type: 'separator'},
      {label: 'toogle devtools', role: 'toggledevtools'}
    ];
  }

}
