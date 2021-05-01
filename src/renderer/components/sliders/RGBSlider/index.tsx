import { h, FunctionComponent, JSX } from 'preact'

import Slider from '../../slider'

import { RGBSliderContainer } from './style'

const RGBSlider: FunctionComponent = (): JSX.Element => {
    return (
        <RGBSliderContainer>
            <Slider type="red" min={0} max={255} value={0} />
            <Slider type="green" min={0} max={255} value={0} />
            <Slider type="blue" min={0} max={255} value={0} />
        </RGBSliderContainer>
    )
}

export default RGBSlider
