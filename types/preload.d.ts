import { IColorpickerSettings } from './settings';

export type PreloadAPI = {
  window: {
    minimize: () => void;
    maximize: {
      maximize: () => void;
      toggle: () => void;
      unmaximize: () => void;
    };
    close: () => void;
  };
  colorpicker: {
    store: {
      get: () => Promise<IColorpickerSettings>;
    };
  };
};

declare global {
  interface Window {
    api: PreloadAPI;
  }
}
