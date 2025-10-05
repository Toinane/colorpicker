import { app } from 'electron'

export default {
  dev: process.env.NODE_ENV === 'development' && !app.isPackaged,
  window: process.platform === 'win32',
  macos: process.platform === 'darwin',
  linux: !['win32', 'darwin'].includes(process.platform),
  oneOf: (platform: string, ...conditions: Array<string>): boolean => conditions.includes(platform),
  allOf: (platform: string, ...conditions: Array<string>): boolean =>
    !conditions.includes(platform),
}
