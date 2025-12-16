<p align="center">
  <a href="https://colorpicker.fr">
    <img src="config/release/icon_osx.png" width="256" height="256" alt="ColorPicker icon" />
  </a>
  <h1 align="center">Colorpicker</h1>
  <p align="center">Modern and powerful color management software</p>
  <p align="center">
    <img src="https://badgen.net/github/release/toinane/colorpicker/stable" />
    <img src="https://img.shields.io/github/downloads/toinane/colorpicker/total.svg">
    <img src="https://img.shields.io/github/downloads/toinane/colorpicker/latest/total.svg">
    <img src="https://img.shields.io/github/release-date/Toinane/colorpicker.svg">
    <img src="https://github.com/Toinane/colorpicker/actions/workflows/dev.yaml/badge.svg">
    <a href="https://snapcraft.io/colorpicker-app">
      <img alt="colorpicker-app" src="https://snapcraft.io/colorpicker-app/badge.svg" />
    </a>
    <a href="https://crowdin.com/project/colorpicker">
      <img src="https://badges.crowdin.net/colorpicker/localized.svg">
    </a>
  </p>
</p>

---

<h4 align="center">
  Want to help with the localization of Colorpicker?
</h4>
<p align="center">
  Please connect to <a href="https://crowdin.com/project/colorpicker" target="_blank">Crowdin and join the project</a>, your contribution is highly appreciated! 👍
</p>

---

## About Colorpicker

Colorpicker is a color management software. Grab any color on your computer screen, easily adjust it to your convenience and save it in personalized color categories.

Colorpicker is built with **Tauri** (Rust + React) and works seamlessly on **Windows**, **macOS** and **Linux**.

## Download

You can download [Colorpicker on the releases page](https://github.com/Toinane/colorpicker/releases).

## Development

#### How to contribute

Colorpicker uses **React 19** for the frontend and **Rust** for the backend via Tauri. **TypeScript** is used throughout for type safety and better developer experience.

You should use a Code Editor compatible with _Prettier_ and _ESLint_ plugins like **VS Code** or **Cursor**.

##### Prerequisites

- Node.js >= 22
- Rust (latest stable) - Install from [rustup.rs](https://rustup.rs/)
- Platform-specific dependencies:
  - **Windows**: Microsoft Visual Studio C++ Build Tools
  - **macOS**: Xcode Command Line Tools
  - **Linux**: `build-essential`, `libgtk-3-dev`, `libwebkit2gtk-4.0-dev`

##### Development

- Install dependencies

```shell
npm install
```

- Launch Colorpicker in development mode (Tauri)

```shell
npm run dev
```

This starts both the Vite dev server and Tauri backend with hot-reload.

- Build for production

```shell
npm run build
```

Outputs will be in `src-tauri/target/release/bundle/`

#### How to make stable release

Colorpicker uses **Github Actions** to make a release automatically. This allows to have the application available on all platforms without having to do it manually.

A **Nightly** version is automatically created at each PR merge on `dev` branch and a **Stable** version is automatically created at each PR merge on `master` branch.
