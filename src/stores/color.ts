import { atom, selector } from 'recoil';

export const redState = atom<number>({
  key: 'red',
  default: 60 / 255,
});

export const greenState = atom<number>({
  key: 'green',
  default: 140 / 255,
});

export const blueState = atom<number>({
  key: 'blue',
  default: 190 / 255,
});

export const colorState = selector<number[]>({
  key: 'color',
  get: ({ get }) => [get(redState), get(greenState), get(blueState)],
});
