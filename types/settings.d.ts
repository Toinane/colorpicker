export type ColorpickerTheme = 'system' | 'light' | 'dark' | 'mix';
export type ColorpickerTool = 'picker' | 'swatch' | 'tint' | 'contrast';

export interface IColorpickerSettings {
  window: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
  color: {
    currentColor: string;
    history: Array<string>;
  };
  settings: {
    sendCrashReport: boolean;
    theme: ColorpickerTheme;
    tools: Array<ColorpickerTool>;
  };
}
