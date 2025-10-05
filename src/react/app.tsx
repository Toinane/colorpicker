import { createRoot } from 'react-dom/client'

import Colorpicker from '@windows/Colorpicker'

import './style.global.css'

window.api.window.handleBlur((event, isBlur) => {
  if (isBlur) document.body.classList.add('blur')
  else document.body.classList.remove('blur')
})

const App = () => <Colorpicker />

createRoot(document.body).render(<App />)
