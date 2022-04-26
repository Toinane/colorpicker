import { FunctionComponent, JSX } from 'preact';

import style from './style.module.css';

const WindowBar: FunctionComponent = (): JSX.Element => (
  <section className={style.windowBar}>
    <section className={style.windowButtons}>
      <div className={style.minimize} />
      <div className={style.maximize} />
      <div className={style.close} />
    </section>
  </section>
);

export default WindowBar;
