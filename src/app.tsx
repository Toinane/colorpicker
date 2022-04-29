import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { Router, Route, BaseLocationHook } from 'wouter-preact';
import { RecoilRoot } from 'recoil';

import Colorpicker from '@windows/Colorpicker';

import './style.global.css';

const currentLocation = () => window.location.hash.replace(/^#/, '') || '/';

const navigate = (to: string) => {
  window.location.hash = to;
};

const useHashLocation: BaseLocationHook = () => {
  const [loc, setLoc] = useState(currentLocation());

  useEffect(() => {
    const handler = () => setLoc(currentLocation());

    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  return [loc, navigate];
};

const App = () => (
  <RecoilRoot>
    <Router hook={useHashLocation}>
      <Route path="/" component={Colorpicker} />
    </Router>
  </RecoilRoot>
);

render(<App />, document.body);
