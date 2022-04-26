import { FunctionComponent, JSX } from 'preact';

import Slider from '../../slider';

const RGBSlider: FunctionComponent = (): JSX.Element => (
  <section>
    <Slider type="red" min={0} max={255} value={0} />
    <Slider type="green" min={0} max={255} value={0} />
    <Slider type="blue" min={0} max={255} value={0} />
  </section>
);

export default RGBSlider;
