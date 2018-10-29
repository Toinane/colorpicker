import * as mocha from 'mocha'
import * as chai from 'chai'

import Color from '../../src/renderer/colorpicker/color'
import colors from './colors.data'

const expect = chai.expect

interface RGB {
  red: number
  green: number
  blue: number
}

interface RGBA extends RGB {
  alpha: number
}

interface HSL {
  hue: number
  saturation: number
  lightness: number
}

interface CMYK {
  cyan: number
  magenta: number
  yellow: number
  key: number
}

type Hexadecimal = string

class ColorTest extends Color {
  constructor () { super() }
  getRGBfromHEX (hex: Hexadecimal): RGB { return super.getRGBfromHEX(hex) }
  getHEXfromRGB (rgb: RGB): Hexadecimal { return super.getHEXfromRGB(rgb) }
  getRGBfromHSL (hsl: HSL): RGB { return super.getRGBfromHSL(hsl) }
  getHSLfromRGB (rgb: RGB): HSL { return super.getHSLfromRGB(rgb) }
  getRGBfromCMYK (cmyk: CMYK): RGB { return super.getRGBfromCMYK(cmyk) }
  getCMYKfromRGB (rgb: RGB): CMYK { return super.getCMYKfromRGB(rgb) }
  getRed (): number { return this.red }
  getGreen (): number { return this.green }
  getBlue (): number { return this.blue }
  getAlpha (): number { return this.alpha }
  getRGB (): RGB { return this.rgb }
  getRGBA (): RGBA { return this.rgba }
  getHEX (): string { return this.hex }
  getHSL (): HSL { return this.hsl }
  getCMYK (): CMYK { return this.cmyk }
}

describe('Basics Color Class', () => {
  it('should get instance of Color' , () => {
    expect(new Color()).to.be.a('Object')
  })

  it('should get default color' , () => {
    const color = new ColorTest()
    const black = colors[0]

    expect(color.getRed()).to.equal(black.rgb.red)
    expect(color.getGreen()).to.equal(black.rgb.green)
    expect(color.getBlue()).to.equal(black.rgb.blue)
    expect(color.getAlpha()).to.equal(black.alpha)
    expect(color.getHEX()).to.be.a('string').and.to.equal(black.hex)
    expect(color.getRGB()).to.be.an('object')
    expect(color.getRGB()).to.deep.equal(black.rgb)
    expect(color.getHSL()).to.deep.equal(black.hsl)
    expect(color.getCMYK()).to.deep.equal(black.cmyk)
  })
})

describe('Basics Colors Formats', () => {
  colors.map(co => {
    const hslFormated = {
      hue: Math.round(co.hsl.hue),
      saturation: Math.round(co.hsl.saturation),
      lightness: Math.round(co.hsl.lightness)
    }
    const cmykFormated = {
      cyan: Math.round(co.cmyk.cyan),
      magenta: Math.round(co.cmyk.magenta),
      yellow: Math.round(co.cmyk.yellow),
      key: Math.round(co.cmyk.key)
    }

    const color = new ColorTest()
    color.updateColorFromRGB(co.rgb)

    it(`Should get ${co.name} in good formats`, () => {
      expect(color.getRed()).to.equal(co.rgb.red)
      expect(color.getGreen()).to.equal(co.rgb.green)
      expect(color.getBlue()).to.equal(co.rgb.blue)
      expect(color.getAlpha()).to.equal(co.alpha)
      expect(color.getHEX()).to.equal(co.hex)
      expect(color.getRGB()).to.deep.equal(co.rgb)
      expect(color.getHSL()).to.deep.equal(co.hsl)
      expect(color.getCMYK()).to.deep.equal(co.cmyk)
      expect(color.getFormatedHSL()).to.deep.equal(hslFormated)
      expect(color.getFormatedCMYK()).to.deep.equal(cmykFormated)
    })
  })
})

describe('Colors Conversion Formats', () => {
  const color = new ColorTest()

  colors.map(co => {
    it(`Should get ${co.name} in HEX format`, () => {
      expect(co.hex).to.equal(color.getHEXfromRGB(co.rgb))
    })

    it(`Should get ${co.name} in RGB format`, () => {
      expect(co.rgb).to.deep.equal(color.getRGBfromHEX(co.hex))
      expect(co.rgb).to.deep.equal(color.getRGBfromHSL(co.hsl))
      expect(co.rgb).to.deep.equal(color.getRGBfromCMYK(co.cmyk))
    })

    it(`Should get ${co.name} in HSL format`, () => {
      expect(co.hsl).to.deep.equal(color.getHSLfromRGB(co.rgb))
    })

    it(`Should get ${co.name} in CMYK format`, () => {
      expect(co.cmyk).to.deep.equal(color.getCMYKfromRGB(co.rgb))
    })
  })
})

describe('A Color Journey', () => {
  const color = new ColorTest()

  colors.map(co => {
    it(`Should get ${co.name} the same value after somes conversions`, () => {
      const rgb = color.getRGBfromHEX(co.hex)
      const hsl = color.getHSLfromRGB(rgb)
      const newRgb = color.getRGBfromHSL(hsl)
      const cmyk = color.getCMYKfromRGB(newRgb)
      const finalRgb = color.getRGBfromCMYK(cmyk)
      const hex = color.getHEXfromRGB(finalRgb)

      expect(co.rgb).to.deep.equal(rgb)
      expect(co.hsl).to.deep.equal(hsl)
      expect(co.rgb).to.deep.equal(newRgb)
      expect(co.cmyk).to.deep.equal(cmyk)
      expect(co.rgb).to.deep.equal(finalRgb)
      expect(co.hex).to.deep.equal(hex)
    })
  })
})