// eslint-disable-next-line max-classes-per-file
type GenericObject = Record<string, unknown>;
type GenericFunction = () => unknown;

declare module 'colorjs.io' {
  function multiplyMatrices(A: Array<Array<number>>, B: Array<Array<number>>): Array<Array<number>>;
  function isString(str: string): boolean;
  function type(o: unknown): string;
  function extend(target: GenericObject, ...sources: Array<GenericObject>): GenericObject;
  function copyDescriptor(target: GenericObject, source: GenericObject): GenericObject;
  function capitalize(str: string): string;
  function toPrecision(n: number, precision: number): number;
  function parseCoord(coord: string): Array<string>;
  function value(obj: GenericObject, prop: string, val?: unknown);
  function constrain(angle: number): number;
  function adjust(arc: 'raw' | 'increasing' | 'decreasing' | 'longer' | 'shorter'): number;
  function isRange(val: unknown): boolean;
  function interpolate(start: number, end: number, p: number): number;

  declare class Hooks {
    add(name: string, callback: GenericFunction, first: boolean): void;
    run(name: string, env: GenericObject): void;
  }

  const ε: number;
  const hasDom: boolean;

  type ColorCoords = Array<number>;
  type ColorSpace = {
    spaceId: string;
    coords: ColorCoords;
    alpha?: number;
  };

  type ParsedArgs = { name: string; rawName: string; args: unknown; rawArgs: unknown };

  export default class Color {
    space: ColorSpace;

    spaceId: string;

    luminance: number;

    uv: number;

    white: Array<number>;

    xy: number;

    hooks: Hooks;

    constructor(
      color: string | Color | ColorCoords | ColorSpace,
      options?: ColorCoords,
      alpha?: number,
    ): void;
    lighten(amount?: number): Color;
    darken(amount?: number): Color;
    distance(color: Color, space?: ColorSpace): number;
    deltaE(color: Color, o: GenericObject): number;
    deltaE76(color: Color): number;
    contrast(color: Color): number;
    getCoords({ inGamut, precision }: { inGamut?: boolean; precision?: number }): Array<number>;
    inGamut(space?: ColorSpace, options?: GenericObject): boolean;
    toGamut({
      method,
      space,
      inPlace,
    }: {
      method?: string;
      space?: ColorSpace;
      inPlace?: boolean;
    }): Color;
    clone(): Color;
    to(space: ColorSpace, { inGamut }: { inGamut?: boolean }): Color;
    toJSON(): { spaceId: string; coords: ColorCoords; alpha: number };
    toString({
      precision,
      format,
      commas,
      inGamut,
      name,
      fallback,
    }: {
      precision?: number;
      format?: '%' | 255 | 'hex';
      commas?: boolean;
      inGamut: boolean;
      name?: string;
      fallback?: GenericFunction;
    }): string;
    equals(color: Color): boolean;
    adapt(
      W1: Array<number>,
      W2: Array<number>,
      id?: 'von Kries' | 'Bradford' | 'CAT02' | 'CAT16',
    ): unknown;
    range(...args: GenericObject): Array<Color>;
    mix(color: Color, p?: number | GenericFunction, options?: GenericFunction): Array<Color>;
    steps(...args: GenericObject): Array<Color>;
    deltaECMC(sample: Color, { l, c }: { l?: number; c?: number }): number;
    deltaE2000(sample: Color, { kL, kC, kH }: { kL?: number; kC?: number; kH?: number }): number;
    deltaEJz(sample: Color): number;
    deltaEITP(sample: Color): number;
    deltaEOK(sample: Color, deltas?: GenericObject): number;
  }

  interface ColorStatic extends Color {
    inGamut(space: ColorSpace, coords: ColorCoords, { epsilon: number }): boolean;
    chromaticAdaptation(
      W1: Array<number>,
      W2: Array<number>,
      XYZ: unknown,
      options?: GenericObject,
    );
    parse(str: string): Color;
    parseFunction(str: string): ParsedArgs;
    convert(coords: ColorCoords, fromSpace: ColorSpace, toSpace: ColorSpace): ColorCoords;
    get(color: Color, ...args: unknown);
    space(space: string): ColorSpace;
    defineSpace({ id, inherits }: { id: 'string'; inherits: GenericObject }): ColorSpace;
    defineShortcut(prop: string, obj?: GenericObject, long?: string): void;
    statify(names?: Array<string>): void;
    range(color1: Color, color2: Color, options?: GenericObject): Array<Color>;
    steps(color1: Color, color2: Color, options?: GenericObject): Array<Color>;
  }

  interface LABColor extends Color {
    fromXYZ(XYZ: ColorCoords): ColorCoords;
    toXYZ(Lab: ColorCoords): ColorCoords;
    parse(str: string, parsed?: ParsedArgs);
  }

  interface LCHColor extends Color {
    from: {
      lab(lab: ColorCoords): ColorCoords;
    };
    to: {
      lab(LCH: ColorCoords): ColorCoords;
    };
    parse(str: string, parsed?: ParsedArgs);
  }

  interface SRGBColor extends Color {
    toXYZ_M: Array<Array<number>>;
    fromXYZ_M: Array<Array<number>>;
    hex: string;
    toLinear(RGB: ColorCoords): number;
    toGamma(RGB: ColorCoords): number;
    toXYZ(rgb: ColorCoords): ColorCoords;
    fromXYZ(XYZ: ColorCoords): ColorCoords;
    toHex({ alpha, collapse }: { alpha?: boolean; collapse?: boolean }): string;
    parseHex(str: string): ColorSpace;
  }

  interface HSLColor extends Color {
    from: {
      srgb(rgb: ColorCoords): ColorCoords;
    };
    to: {
      srgb(hsl: ColorCoords): ColorCoords;
    };
    parse(str: string, parsed?: ParsedArgs);
  }

  interface HWBColor extends Color {
    from: {
      srgb(rgb: ColorCoords): ColorCoords;
      hsv(hsv: ColorCoords): ColorCoords;
      hsl(hsl: ColorCoords): ColorCoords;
    };
    to: {
      srgb(hwb: ColorCoords): ColorCoords;
      hsv(hwb: ColorCoords): ColorCoords;
      hsl(hwb: ColorCoords): ColorCoords;
    };
    parse(str: string, parsed?: ParsedArgs);
  }

  interface HSVColor extends Color {
    from: {
      hsl(hsl: ColorCoords): ColorCoords;
    };
    to: {
      hsl(hsv: ColorCoords): ColorCoords;
    };
  }

  interface P3Color extends SRGBColor {
    toXYZ_M: Array<Array<number>>;
    fromXYZ_M: Array<Array<number>>;
  }

  interface REC2020Color extends SRGBColor {
    toXYZ_M: Array<Array<number>>;
    fromXYZ_M: Array<Array<number>>;
  }

  interface OKLABColor extends Color {
    XYZtoLMS_M: Array<Array<number>>;
    LMStoXYZ_M: Array<Array<number>>;
    LMStoLab_M: Array<Array<number>>;
    LabtoLMS_M: Array<Array<number>>;
    fromXYZ(XYZ: ColorCoords): ColorCoords;
    toXYZ(OKLab: ColorCoords): ColorCoords;
  }

  interface OKLCH extends Color {
    from: {
      oklab(oklab: ColorCoords): ColorCoords;
    };
    to: {
      oklab(oklch: ColorCoords): ColorCoords;
    };
    parse(str: string, parsed?: ParsedArgs);
  }
}
