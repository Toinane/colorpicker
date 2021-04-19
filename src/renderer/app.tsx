import { Fragment, h, render } from 'preact'
import RGBSlider from './components/sliders/RGBSlider'

const App = () => {
    return (
        <Fragment>
            <h1>Colorpicker</h1>
            <RGBSlider />
        </Fragment>
    )
}

render(<App />, document.body)
