import { createRoot } from 'react-dom/client'
import { Route, Switch } from 'wouter'

import Colorpicker from '@windows/Colorpicker'

import './style.global.css'

// window.api.window.handleBlur((event, isBlur) => {
//   if (isBlur) document.body.classList.add('blur')
//   else document.body.classList.remove('blur')
// })

const App = () => (
  <Switch>
    <Route path="/" component={Colorpicker} />
    <Route>Something went wrong.</Route>
  </Switch>
)

createRoot(document.body).render(<App />)
