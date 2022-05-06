import { useEffect } from 'preact/hooks';

import WindowBar from '@components/windowBar';
import ColorBackground from '@components/colorBackground';
import RGBSlider from '@components/sliders/RGBSlider';
import HexInput from '@components/sliders/hexInput';

const Colorpicker = () => {
  useEffect(() => {
    // window.api.colorpicker.store.get().then((store) => {
    // });
  }, []);

  return (
    <>
      <WindowBar />
      <ColorBackground />
      <RGBSlider />
      <HexInput />
    </>
  );
};

export default Colorpicker;
