import { FunctionComponent, JSX } from 'preact';

import style from './style.module.css';

const ColorBackground: FunctionComponent = (): JSX.Element => (
  <section className={style.colorBackground} />
);

export default ColorBackground;
