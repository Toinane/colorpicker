import { useEffect } from 'preact/hooks';
// import { useRecoilState } from 'recoil';

import WindowBar from '@components/windowBar';
import ColorBackground from '@components/colorBackground';
import RGBSlider from '@components/sliders/RGBSlider';

const Colorpicker = () => {
  // const [, setStore] = useRecoilState();

  useEffect(() => {
    // window.api.colorpicker.store.get().then((store) => {
    // });
  }, []);

  return (
    <>
      <WindowBar />
      <ColorBackground />
      <RGBSlider />
    </>
  );
};

export default Colorpicker;
