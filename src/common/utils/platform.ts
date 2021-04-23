import process from 'process'
import { app } from 'electron'

type OS = 'win32' | 'darwin' | 'linux'

const macos: boolean = process.platform === 'darwin'
const win: boolean = process.platform === 'win32'
const linux = !['win32', 'darwin'].includes(process.platform)

export const is = {
    win,
    macos,
    linux,
    dev: !app.isPackaged,
    one: (bool: OS, ...conditions: Array<OS>): boolean => conditions.includes(bool),
    //all: (bool: OS, ...conditions: Array<OS>): boolean => !conditions.includes(!bool),
}
