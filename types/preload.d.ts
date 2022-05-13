import { Event } from 'electron';
import { IColorpickerSettings } from './settings';

export type IpcRendererCallback<T> = (event: Event, value: T) => void;

export type PreloadAPI = {
  window: {
    minimize: () => void;
    maximize: {
      maximize: () => void;
      toggle: () => void;
      unmaximize: () => void;
    };
    close: () => void;
    handleBlur: (callback: IpcRendererCallback<boolean>) => void;
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
