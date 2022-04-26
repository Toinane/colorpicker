import { Fragment, render } from 'preact';
import RGBSlider from './components/sliders/RGBSlider';

const App = () => (
  <Fragment>
    <h1>Colorpicker</h1>
    <RGBSlider />
  </Fragment>
);

render(<App />, document.body);
