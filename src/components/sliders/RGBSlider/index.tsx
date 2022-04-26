import { FunctionComponent, JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import Slider from '../slider';

const RGBSlider: FunctionComponent = (): JSX.Element => {
  const [red, setRed] = useState(0);
  const [green, setGreen] = useState(0);
  const [blue, setBlue] = useState(0);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--colopicker-main-color',
      `rgb(${red},${green},${blue})`,
    );
  }, [red, green, blue]);

  const changeVal = (value: number, type: string): void => {
    switch (type) {
      case 'red':
        setRed(value);
        break;
      case 'green':
        setGreen(value);
        break;
      case 'blue':
        setBlue(value);
        break;
      default:
    }
  };

  return (
    <section>
      <Slider type="red" min={0} max={255} value={0} onUpdate={changeVal} />
      <Slider type="green" min={0} max={255} value={0} onUpdate={changeVal} />
      <Slider type="blue" min={0} max={255} value={0} onUpdate={changeVal} />
    </section>
  );
};

export default RGBSlider;
