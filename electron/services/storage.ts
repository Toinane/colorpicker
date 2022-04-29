import ElectronLightStorage from 'electron-light-storage';

import { IColorpickerSettings } from 'types/settings';

const storage = new ElectronLightStorage();

export const colorpickerSettings = storage.get('colorpicker') as IColorpickerSettings;

export const swatch = storage.get('swatch');
