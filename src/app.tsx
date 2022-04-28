import { Fragment, render } from 'preact';

import WindowBar from './components/windowBar';
import ColorBackground from './components/colorBackground';
import RGBSlider from './components/sliders/RGBSlider';

import './style.css';

const App = () => (
  <Fragment>
    <WindowBar />
    <ColorBackground />
    <RGBSlider />
  </Fragment>
);

render(<App />, document.body);
