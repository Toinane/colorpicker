export type ColorpickerTheme = 'system' | 'light' | 'dark';
export type ColorpickerTool = 'picker' | 'swatch' | 'tint' | 'contrast';

export interface IWindowSettings {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  theme?: ColorpickerTheme;
}
export interface IColorpickerSettings extends IWindowSettings {
  currentColor: string;
  history: Array<string>;
  sendCrashReport: boolean;
  tools: Array<ColorpickerTool>;
}
