import styled from 'styled-components'

export const SliderContainer = styled.section`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
`

export const Input = styled.input`
    margin: 0;
    appearance: none;
    outline: none;
    background: none;
    width: 100%;
    box-sizing: border-box;

    &::-webkit-slider-thumb {
        position: relative;
        z-index: 100;
        appearance: none;
        height: 22px;
        width: 22px;
        border-radius: 50%;
        background: #ffffff;
        border-bottom: 2px solid #f3f3f3;
        cursor: pointer;
    }
`

export const Progress = styled.progress`
    -webkit-appearance: none;
    position: absolute;
    width: 97%;
    height: 10px;

    ::-webkit-progress-bar {
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 6px;
    }

    ::-webkit-progress-value {
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 6px;
    }

    &.red::-webkit-progress-value {
        background-color: rgb(255, 87, 57);
    }

    &.green::-webkit-progress-value {
        background-color: rgb(105, 195, 59);
    }

    &.blue::-webkit-progress-value {
        background-color: rgb(65, 165, 225);
    }

    &.hue::-webkit-progress-bar {
        background: -webkit-linear-gradient(
                left,
                hsla(0, var(--saturation), var(--lightness), 0.85),
                hsla(60, var(--saturation), var(--lightness), 0.85),
                hsla(120, var(--saturation), var(--lightness), 0.85),
                hsla(180, var(--saturation), var(--lightness), 0.85),
                hsla(240, var(--saturation), var(--lightness), 0.85),
                hsla(300, var(--saturation), var(--lightness), 0.85),
                hsla(360, var(--saturation), var(--lightness), 0.85)
            ),
            -webkit-linear-gradient(left, #727e88, #feffff, #8e9eab, #eef2f3, #727e88, #eef2f3, #727e88);
    }

    &.saturation::-webkit-progress-bar {
        background: -webkit-linear-gradient(
                left,
                hsla(150, 0%, var(--lightness), 0.85),
                hsla(var(--hue), 100%, var(--lightness), 0.85)
            ),
            -webkit-linear-gradient(left, #feffff, #727e88);
    }

    &.lightness::-webkit-progress-bar {
        background: -webkit-linear-gradient(
            left,
            hsla(var(--hue), var(--saturation), 5%, 1),
            hsla(var(--hue), var(--saturation), 50%, 1),
            hsla(var(--hue), var(--saturation), 95%, 1)
        );
    }
`
