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
};

declare global {
  interface Window {
    api: PreloadAPI;
  }
}
