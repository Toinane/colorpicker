<p align="center">
  <a href="https://crea-th.at/p/colorpicker">
    <img src="build/icon.png" width="256" height="256" alt="ColorPicker icon" />
  </a>
  <h1 align="center">Colorpicker</h1>
  <p align="center">A mininal but complete colorpicker desktop app</p>
</p>

Colorpicker is a desktop tool with *Electron* to get and save colors code quickly for *OSX*, *Windows* and *Linux*!

<p align="center">
  <img src="https://github.com/Toinane/colorpicker-website/blob/master/gifs/colorpicker.gif?raw=true"  alt="ColorPicker App" />
</p>

Colorpicker's menu come with a lot of cool features :

- [Pin](#pin): pin Colorpicker to the foreground;
- [Picker](#picker): open an eyedropper who can pick a color from your desktop;
- [Colorsbook](#colorsbook): open Colorsbook, a color manager;
- [Shading](#shading): show three bar of shading — hue bar, natural bar and lightness bar;
- [Opacity](#opacity): toggle Opacity range;
- [Clean Vue](#clean-vue): unshow menu, ranges and inputs;
- [Magic color](#magic-color): show colors from the clipboard;
- [Random](#random): show a random color;
- [Settings](#settings): open the preferences panel.

## Pin
![Pin gif](https://github.com/Toinane/colorpicker-website/blob/master/gifs/pin.gif?raw=true)

With Pin, you can bring Colorpicker to the foreground. This makes it convenient to work quickly with different applications at the same time.

## Picker
#### Note: This feature isn't available for Linux. See [#18](https://github.com/Toinane/colorpicker/issues/18)
![Picker gif](https://github.com/Toinane/colorpicker-website/blob/master/gifs/picker.gif?raw=true)

The Picker allows you to quickly retrieve a color anywhere on the screen. Whether it's on your browser, Photoshop, or whatever.

## Colorsbook
![Colorsbook gif](https://github.com/Toinane/colorpicker-website/blob/master/gifs/colorsbook.gif?raw=true)

Colorsbook is a full-fledged application. It allows you to store your colors, categorize them, and easily retrieve them. It is destined to mature over time.
**Cool tip:** you can save color from colorpicker with ```CMD+S``` or ```CTRL+S```! 

## Shading
![Shading gif](https://github.com/Toinane/colorpicker-website/blob/master/gifs/shades.gif?raw=true)

With the shades, you can find the perfect color you need. You have a chromatic bar, a natural color bar and a shadow bar.

## Opacity
![Opacity gif](https://github.com/Toinane/colorpicker-website/blob/master/gifs/opacity.gif?raw=true)

This feature is a bit special. It allows you to render the application transparent. This can be useful to see the appearance of a transparent color.

## Focus Mode
![Focus screenshot](https://github.com/Toinane/colorpicker-website/blob/master/gifs/focus.png?raw=true)

Need to compare a color or clean up the interface? This feature is for you, this will hide the sliders and make the menu more transparent.

## Magic Color
This functionality is still under development. Currently, it allows you to display the first color that is in your clipboard. This works with hexadecimal and RGB codes

## Random
A traditional feature, it allows you to display a color randomly.

## Settings
![Settings gif](https://github.com/Toinane/colorpicker-website/blob/master/gifs/settings.gif?raw=true)

The settings menu allows you to customize your Colorpicker, I let you discover it yourself :)!

# Download
- You can download the [latest release on the website!](https://colorpicker.crea-th.at)
- Or [on GitHub releases here.](https://github.com/Toinane/colorpicker/releases)

## Want to support me?

You can [buy me a coffee here](https://toinane.itch.io/colorpicker)! Thank you!

#### **Happy Design !**

# Developers

### Changelog
See [changelog here](changelog.md).

### How to compile
- Install dependencies:
```shell
  yarn
```

- To build C/C++ modules to the correct Electron version, use:
```shell
  yarn rebuild
```

- To build a new version:
```shell
  # You can build nightly & release only for your current OS.
  # i.e. you can't build a OSX version if you use a Windows  

  # build a nightly version
  yarn nightly

  # build a release version
  yarn release
```
