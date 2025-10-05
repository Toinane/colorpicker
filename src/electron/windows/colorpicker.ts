import { ipcMain } from 'electron'
import Store from 'electron-store'

import type { IColorpickerWindowSchema } from '@interfaces/settings'

import createLogger from '@common/logger'
import Window from './windowManager'

const logger = createLogger('ColorpickerWindow')

export default class ColorpickerWindow extends Window<IColorpickerWindowSchema> {
  declare store: Store<IColorpickerWindowSchema>

  constructor() {
    super('colorpicker', {
      width: {
        type: 'number',
        default: 400,
      },
      height: {
        type: 'number',
        default: 150,
      },
    })

    // const { scaleFactor } = screen.getPrimaryDisplay();

    this.props = {
      minWidth: 400,
      minHeight: 150,
    }
  }

  eventsHandle() {
    super.eventsHandle()
    ipcMain.handle('colorpicker:store:get', (el) => this.store.get(el))

    ipcMain.handle(
      'colorpicker:store:update',
      (_, updatedStore: Partial<IColorpickerWindowSchema>) => {
        console.log(this.window?.getBounds())
        console.log(updatedStore)
        this.store.set(updatedStore)
      },
    )
  }
}
