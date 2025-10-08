import Window from './windowManager'

export default class SettingsWindow extends Window {
  constructor() {
    super('settings', {
      width: {
        type: 'number',
        default: 600,
      },
      height: {
        type: 'number',
        default: 400,
      },
    })

    this.props = {
      minWidth: 400,
      minHeight: 250,
      backgroundMaterial: 'mica',
      // TODO: test with different vibrancy types on macOS
      vibrancy: 'appearance-based',
      // accentColor: '#1E90FF',
    }
  }
}
