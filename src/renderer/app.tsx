import { I18nextProvider } from 'react-i18next'
import { Fragment, h, render } from 'preact'

import i18n from '../common/localization/i18n.renderer'

import RGBSlider from './components/sliders/RGBSlider'

const App = () => {
    return (
        <I18nextProvider i18n={i18n}>
            <Fragment>
                <h1>Colorpicker</h1>
                <RGBSlider />
            </Fragment>
        </I18nextProvider>
    )
}

render(<App />, document.body)
