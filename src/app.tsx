import { Fragment, render } from 'preact';
import RGBSlider from './components/sliders/RGBSlider';
import WindowBar from './components/windowBar';

import './style.css';

const App = () => (
  <Fragment>
    <WindowBar />
    <RGBSlider />
  </Fragment>
);

render(<App />, document.body);
