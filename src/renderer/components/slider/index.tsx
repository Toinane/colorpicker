import { h } from 'preact'
import { useState } from 'preact/hooks'
import styled from 'styled-components'

const Input = styled.input`
    margin: 0;
    padding: 3px 0;
    appearance: none;
    outline: none;
    background: none;
    width: 100%;
    box-sizing: border-box;

    &::-webkit-slider-thumb {
        position: relative;
        zindex: 100;
        bottom: 10px;
        appearance: none;
        height: 22px;
        width: 22px;
        borderradius: 50%;
        background: #ffffff;
        borderbottom: 2px solid #f3f3f3;
        cursor: pointer;
    }
`

const Progress = styled.progress`
    &::-webkit-progress-bar: {
        position: absolute;
        width: 99%;
        top: 5px;
        left: 1px;
        backgroundcolor: rgba(255, 255, 255, 0.9);
        borderradius: 6px;
        height: 10px;
    }
    &::-webkit-progress-value: {
        borderradius: 6px;
        height: 10px;
    }
`

const styles = {
    container: {
        background: 'gray',
        position: 'relative',
        height: '20px',
        padding: '6px 0',
    },
}

const Slider = () => {
    const [value, setValue] = useState(0)

    const changeValue = (el: any) => {
        setValue(el.target.value || 0)
    }

    return (
        <div style={styles.container}>
            <Input type="range" min="0" max="255" value={value} onInput={changeValue} />
            <Progress min="0" max="255" value={value} />
        </div>
    )
}

export default Slider