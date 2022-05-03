import { atom, selector } from 'recoil';

import Color from 'colorjs.io';

export const redState = atom<number>({
  key: 'red',
  default: 60,
});

export const greenState = atom<number>({
  key: 'green',
  default: 140,
});

export const blueState = atom<number>({
  key: 'blue',
  default: 190,
});

export const colorState = selector<Color>({
  key: 'color',
  get: ({ get }) => new Color('srgb', [get(redState), get(greenState), get(blueState)]),
});
