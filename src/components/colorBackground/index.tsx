import { FunctionComponent, JSX } from 'preact';
import { useEffect } from 'preact/hooks';
import { useRecoilValue } from 'recoil';

import { colorState } from '@stores/color';

import style from './style.module.css';

const ColorBackground: FunctionComponent = (): JSX.Element => {
  const color = useRecoilValue(colorState);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--colopicker-main-color',
      `rgb(${color.red},${color.green},${color.blue})`,
    );
  }, [color]);

  return <section className={style.colorBackground} />;
};

export default ColorBackground;
