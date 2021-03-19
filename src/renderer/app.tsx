import { Fragment, h, render } from 'preact'
import Slider from './components/slider'

const App = () => {
    return (
        <Fragment>
            <h1>Colorpicker</h1>
            <Slider />
        </Fragment>
    )
}

render(<App />, document.body)
