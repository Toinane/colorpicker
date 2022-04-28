import { FunctionComponent, JSX } from 'preact';

import AppIcons from './appIcons';

import style from './style.module.css';

const WindowBar: FunctionComponent = (): JSX.Element => (
  <section className={style.windowBar}>
    <AppIcons />
    <section className={style.windowButtons}>
      <div className={style.menu} />
      <div className={style.minimize} />
      <div className={style.maximize} />
      <div className={style.close} />
    </section>
  </section>
);

export default WindowBar;
