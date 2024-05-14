import { FunctionComponent, JSX } from 'preact';

import style from './style.module.css';

export enum IAppIcon {
  PICKER = 'picker',
  SWATCH = 'swatch',
  TINT = 'tint',
  CONTRAST = 'contrast',
  OPACITY = 'opacity',
  LOCK = 'lock',
  UNLOCK = 'unlock',
}

type AppIconProps = {
  type: IAppIcon;
};

const AppIcon: FunctionComponent<AppIconProps> = ({ type }): JSX.Element => {
  const getIcon = (icon: IAppIcon) => {
    switch (icon) {
      case IAppIcon.PICKER:
        return (
          <svg viewBox="0 0 256 256">
            <path
              className={style.mainColor}
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M125.845 111.843L132.917 118.914L137.086 123.084L144.157 130.155L116.24 158.071C116.143 158.162 115.999 158.297 115.81 158.472C115.395 158.858 114.765 159.437 113.946 160.178C112.307 161.662 109.921 163.784 106.99 166.279C101.087 171.304 93.1599 177.688 84.7911 183.416C76.1974 189.297 68.1388 193.787 61.8443 195.837C60.9283 196.136 60.1465 196.355 59.4845 196.516C59.6449 195.853 59.8644 195.072 60.1628 194.156C62.2132 187.861 66.7027 179.803 72.5841 171.209C78.3117 162.84 84.696 154.913 89.721 149.01C92.2164 146.079 94.3378 143.693 95.8215 142.054C96.5626 141.235 97.1424 140.605 97.5276 140.19C97.7028 140.001 97.8376 139.857 97.9288 139.76L125.845 111.843ZM113.825 99.8222L85.7255 127.921C85.7255 127.921 26.4978 190.407 46.0454 209.955C65.5931 229.502 128.079 170.274 128.079 170.274L156.178 142.175L172.661 158.659C176.176 162.174 181.875 162.174 185.389 158.659L190.364 153.684C193.879 150.169 193.879 144.471 190.364 140.956L173.831 124.423C174.323 123.997 174.803 123.551 175.27 123.084L212.039 86.314C222.583 75.7698 222.583 58.6743 212.039 48.1302L207.87 43.9607C197.326 33.4166 180.23 33.4166 169.686 43.9607L132.917 80.7303C132.449 81.1974 132.003 81.6774 131.577 82.169L115.044 65.6358C111.529 62.1211 105.831 62.121 102.316 65.6358L97.3411 70.6108C93.8264 74.1255 93.8264 79.824 97.3411 83.3387L113.825 99.8222ZM56.3032 196.88C56.3097 196.871 56.3971 196.877 56.5462 196.923C56.3714 196.912 56.2968 196.889 56.3032 196.88ZM59.0772 199.454C59.1233 199.603 59.1288 199.69 59.1201 199.697C59.1114 199.703 59.0883 199.629 59.0772 199.454Z"
            />
          </svg>
        );
      case IAppIcon.SWATCH:
        return (
          <svg viewBox="0 0 256 256">
            <path
              className={style.thirdColor}
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M126.595 214.512C123.744 218.085 120.435 221.278 116.757 224H215C226.046 224 235 215.046 235 204V159C235 147.954 226.046 139 215 139H202.106L126.595 214.512Z"
            />
            <path
              className={style.secondColor}
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M137.433 189.671L207.122 119.982C214.933 112.171 214.933 99.5079 207.122 91.6974L175.303 59.8776C167.492 52.0671 154.829 52.0672 147.018 59.8776L138.012 68.884V181.856C138.012 184.512 137.814 187.121 137.433 189.671Z"
            />
            <path
              className={style.mainColor}
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M63 32C51.9543 32 43 40.9543 43 52V181.5C43 204.972 62.0279 224 85.5 224C108.972 224 128 204.972 128 181.5V52C128 40.9543 119.046 32 108 32H63ZM85.5 195.124C93.0244 195.124 99.1241 189.024 99.1241 181.5C99.1241 173.976 93.0244 167.876 85.5 167.876C77.9756 167.876 71.8759 173.976 71.8759 181.5C71.8759 189.024 77.9756 195.124 85.5 195.124Z"
            />
          </svg>
        );
      case IAppIcon.TINT:
        return (
          <svg viewBox="0 0 256 256">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M90.26 117.897C101.95 117.897 112.082 111.229 117.061 101.489H213.992C221.544 101.489 227.665 95.3669 227.665 87.8153C227.665 80.2637 221.544 74.1419 213.992 74.1419H117.061C112.082 64.4019 101.95 57.7339 90.26 57.7339C78.5701 57.7339 68.4376 64.4019 63.4586 74.1419H42.008C34.4564 74.1419 28.3347 80.2637 28.3347 87.8153C28.3347 95.3669 34.4564 101.489 42.008 101.489H63.4586C68.4376 111.229 78.5701 117.897 90.26 117.897ZM198.191 154.511H213.992C221.544 154.511 227.665 160.633 227.665 168.185C227.665 175.736 221.544 181.858 213.992 181.858H198.191C193.212 191.598 183.08 198.266 171.39 198.266C159.7 198.266 149.568 191.598 144.589 181.858H42.008C34.4564 181.858 28.3347 175.736 28.3347 168.185C28.3347 160.633 34.4564 154.511 42.008 154.511H144.589C149.568 144.771 159.7 138.103 171.39 138.103C183.08 138.103 193.212 144.771 198.191 154.511Z"
              className={style.mainColor}
            />
          </svg>
        );
      case IAppIcon.CONTRAST:
        return (
          <svg viewBox="0 0 256 256">
            <path
              className={style.mainColor}
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M199.558 128C199.558 167.52 167.52 199.558 128 199.558V56.4424C167.52 56.4424 199.558 88.4798 199.558 128ZM220.558 128C220.558 179.118 179.118 220.558 128 220.558C76.8818 220.558 35.4424 179.118 35.4424 128C35.4424 76.8818 76.8818 35.4424 128 35.4424C179.118 35.4424 220.558 76.8818 220.558 128Z"
            />
          </svg>
        );
      case IAppIcon.OPACITY:
        return (
          <svg viewBox="0 0 256 256">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M58.5676 139.693C57.5001 145.811 57.0538 151.481 57.0538 156.693C57.0538 195.875 88.8175 227.639 128 227.639C167.182 227.639 198.946 195.875 198.946 156.693C198.946 151.376 198.539 145.723 197.545 139.693C193.368 114.346 178.827 82.337 140.599 40.675C138.949 38.8769 137.255 37.0607 135.516 35.2263C133.373 32.9658 131.161 30.6775 128.878 28.3612C126.822 30.3488 124.822 32.3203 122.876 34.2756C120.821 36.3406 118.826 38.3875 116.89 40.4162C78.2417 80.9173 63.0145 114.203 58.5676 139.693ZM128.613 52.7563C163.22 90.6099 176.148 118.713 180.268 139.693H75.8789C80.2761 118.525 93.7905 89.403 128.613 52.7563Z"
              className={style.mainColor}
            />
          </svg>
        );
      case IAppIcon.LOCK:
        return (
          <svg viewBox="0 0 256 256">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M102.304 52.4915C95.7374 58.5165 91 67.7474 91 80.8757V118.376H73V80.8757C73 63.0041 79.6376 48.86 90.1339 39.2288C100.485 29.7304 114.085 25.0743 127.451 25.0009C140.818 24.9274 154.46 29.437 164.853 38.9354C175.392 48.5669 182 62.797 182 80.8757V118.376H164V80.8757C164 67.4545 159.233 58.1846 152.71 52.2223C146.04 46.1269 136.932 42.9491 127.549 43.0006C118.165 43.0522 109.015 46.3336 102.304 52.4915Z" className={style.secondColor} />
            <path fill-rule="evenodd" clip-rule="evenodd" d="M55 113C46.7157 113 40 119.716 40 128V207C40 215.284 46.7157 222 55 222H201C209.284 222 216 215.284 216 207V128C216 119.716 209.284 113 201 113H55ZM125 159C119.477 159 115 163.477 115 169V183C115 188.523 119.477 193 125 193H130C135.523 193 140 188.523 140 183V169C140 163.477 135.523 159 130 159H125Z" className={style.mainColor}/>
          </svg>
        );
      case IAppIcon.UNLOCK:
        return (
          <svg viewBox="0 0 256 256">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M107.113 43.7499C113.07 40.0113 120.186 38.0405 127.443 38.0006C136.825 37.9491 145.933 41.1269 152.603 47.2223C159.127 53.1846 163.893 62.4545 163.893 75.8757V113.376H181.893V75.8757C181.893 57.797 175.285 43.5669 164.746 33.9354C154.353 24.437 140.711 19.9274 127.344 20.0009C117.189 20.0567 106.898 22.7581 98 28.2191L107.113 43.7499Z" className={style.mainColor} />
            <path fill-rule="evenodd" clip-rule="evenodd" d="M55 113C46.7157 113 40 119.716 40 128V207C40 215.284 46.7157 222 55 222H201C209.284 222 216 215.284 216 207V128C216 119.716 209.284 113 201 113H55ZM125 159C119.477 159 115 163.477 115 169V183C115 188.523 119.477 193 125 193H130C135.523 193 140 188.523 140 183V169C140 163.477 135.523 159 130 159H125Z" className={style.secondColor}/>
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 256 256">
            <path
              d="M194.614 135.262V120.738L216.974 99.0039L215.188 94.3521C211.716 85.2994 206.849 76.8461 200.764 69.2989L197.632 65.4125L167.601 73.9167L155.016 66.6551L147.369 36.386L142.437 35.6155C132.864 34.1251 123.118 34.1323 113.548 35.6369L108.619 36.4049L100.981 66.6525L88.4027 73.9142L58.3579 65.4049L55.2255 69.3077C52.205 73.0754 49.4751 77.0673 47.0593 81.2489C44.6417 85.4355 42.5494 89.8018 40.8009 94.3093L39 98.9674L61.3845 120.738V135.262L39.0252 156.996L40.8109 161.655C44.2829 170.707 49.1495 179.16 55.2343 186.708L58.3667 190.594L88.3977 182.09L100.976 189.352L108.624 219.621L113.556 220.391C118.302 221.132 123.099 221.505 127.902 221.504C132.774 221.503 137.638 221.124 142.45 220.371L147.384 219.6L155.019 189.353L167.604 182.091L197.648 190.6L200.781 186.698C203.801 182.93 206.531 178.938 208.947 174.756C211.365 170.57 213.457 166.204 215.205 161.696L217.006 157.038L194.614 135.262ZM128.062 156.704C112.18 156.704 99.3061 143.825 99.3061 127.937C99.3061 112.049 112.18 99.1701 128.062 99.1701C143.944 99.1701 156.818 112.049 156.818 127.937C156.818 143.825 143.944 156.704 128.062 156.704Z"
              className={style.mainColor}
            />
          </svg>
        );
    }
  };

  return <section className={style.section}>{getIcon(type)}</section>;
};

export default AppIcon;
