import { h, FunctionComponent, JSX } from 'preact'
import { useState } from 'preact/hooks'

import { Input, Progress, SliderContainer } from './style'

type SliderProps = {
    min?: number
    max?: number
    value?: number
    type?: string
}

const Slider: FunctionComponent<SliderProps> = ({ min = 0, max = 255, value = 0, type }): JSX.Element => {
    const [currentValue, setValue] = useState(value)

    const changeValue = (ev: JSX.TargetedEvent<HTMLInputElement, InputEvent>) => {
        setValue(ev.target instanceof HTMLInputElement ? Number(ev.target.value) : 0)
    }

    return (
        <SliderContainer>
            <Input type="range" min={min} max={max} value={currentValue} onInput={changeValue} />
            <Progress min={min} max={max} value={currentValue} className={type} />
        </SliderContainer>
    )
}

export default Slider
