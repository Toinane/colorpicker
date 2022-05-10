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
      update: (updatedStore: Partial<IColorpickerSettings>) => void;
    };
  };
};

declare global {
  interface Window {
    api: PreloadAPI;
  }
}
