import { createRoot } from 'react-dom/client'
import { Router, Route } from 'wouter'
import { useHashLocation } from 'wouter/use-hash-location'

import Colorpicker from '@windows/Colorpicker'

import './style.global.css'

// window.api.window.handleBlur((event, isBlur) => {
//   if (isBlur) document.body.classList.add('blur')
//   else document.body.classList.remove('blur')
// })

const App = () => (
  <Router hook={useHashLocation}>
    <Route path="/colorpicker" component={Colorpicker} />
    <Route path="/" component={Colorpicker} />
  </Router>
)

createRoot(document.body).render(<App />)
