// import { useCallback, useEffect } from 'preact/hooks';
// import { useRecoilState } from 'recoil';
// import { converter, formatRgb } from 'culori';
// import { Color } from 'culori/src/common';

// import debounce from '@common/debounce';

import WindowBar from '@components/windowBar';
import ColorBackground from '@components/colorBackground';
import RGBSlider from '@components/sliders/RGBSlider';
import HexInput from '@components/sliders/hexInput';

// import { redState, greenState, blueState } from '@stores/color';

const Colorpicker = () => (
  // const [r, setRed] = useRecoilState(redState);
  // const [g, setGreen] = useRecoilState(greenState);
  // const [b, setBlue] = useRecoilState(blueState);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // const saveColor = useCallback(
  //   debounce((red: number, green: number, blue: number) => {
  //     window.api.colorpicker.store.update({
  //       currentColor: formatRgb({
  //         r: red,
  //         g: green,
  //         b: blue,
  //       } as Color),
  //     });
  //   }, 500),
  //   [],
  // );

  // useEffect(() => {
  //   window.api.colorpicker.store
  //     .get()
  //     .then((store) => {
  //       const rgb = converter('rgb')(store.currentColor);
  //       if (!rgb) return;
  //       setRed(rgb.r);
  //       setGreen(rgb.g);
  //       setBlue(rgb.b);
  //     })
  //     .catch((e) => console.log(e));
  // }, [setBlue, setGreen, setRed]);

  // useEffect(() => {
  //   // eslint-disable-next-line @typescript-eslint/no-floating-promises
  //   saveColor(r, g, b);
  // }, [r, g, b, saveColor]);

  <>
    <WindowBar />
    <ColorBackground />
    <RGBSlider />
    <HexInput />
  </>
);
export default Colorpicker;
