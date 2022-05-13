import { FunctionComponent, JSX } from 'preact';

import AppIcon, { IAppIcon } from './appIcon';

import style from './style.module.css';

const AppIcons: FunctionComponent = (): JSX.Element => (
  <section className={style.appIcons}>
    <AppIcon type={IAppIcon.PICKER} />
    <AppIcon type={IAppIcon.SWATCH} />
    <AppIcon type={IAppIcon.TINT} />
    <AppIcon type={IAppIcon.CONTRAST} />
    <AppIcon type={IAppIcon.OPACITY} />
  </section>
);

export default AppIcons;
