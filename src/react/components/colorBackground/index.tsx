import { FunctionComponent, JSX } from 'preact';
import { useEffect } from 'preact/hooks';
import { useRecoilValue } from 'recoil';

import { colorState } from '@stores/color';

import style from './style.module.css';

const ColorBackground: FunctionComponent = (): JSX.Element => {
  const color = useRecoilValue(colorState);

  useEffect(() => {
    const [red, green, blue] = color;

    document.documentElement.style.setProperty(
      '--colopicker-main-color',
      `rgb(${red * 255},${green * 255},${blue * 255})`,
    );
  }, [color]);

  return <section className={style.colorBackground} />;
};

export default ColorBackground;
