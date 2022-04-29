import { atom, selector } from 'recoil';

type Color = {
  red: number;
  green: number;
  blue: number;
};

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
  get: ({ get }) => ({
    red: get(redState),
    green: get(greenState),
    blue: get(blueState),
  }),
});
