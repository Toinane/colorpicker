'use strict'

let cp, cm

document.addEventListener('DOMContentLoaded', () => ipcRenderer.send('init-colorpicker'), false)

ipcRenderer.on('init', (event, config) => {
  cp = new Colorpicker({
    color: config.color,
    history: config.history,
    colorfullApp: config.colorfullApp
  })
  cm = new ContextMenu()
  if (config.posButton === 'right') document.querySelector('.toolbar').classList.add('setRight')
  cm.initButtonsType(config.typeButton, 'colorpicker')
  initTools(config.tools)
  initToolsEvent()
  initEvents()
})

ipcRenderer.on('changeColor', (event, color) => cp.setNewColor(color))
ipcRenderer.on('previewColor', (event, color) => cp.setNewColor(color, true))
ipcRenderer.on('changeColorfullApp', (event, bool) => cp.colorfullApp = bool)
ipcRenderer.on('shortSave', () => cb.save())
ipcRenderer.on('shortCopyHex', () => cp.copyHex())
ipcRenderer.on('shortCopyRGB', () => cp.activeAlpha ? cp.copyRGBA() : cp.copyRGB())
ipcRenderer.on('shortNegative', () => cp.setNegativeColor())
ipcRenderer.on('shortPin', () => togglePin())
ipcRenderer.on('shortShading', () => toggleShading())
ipcRenderer.on('shortRandom', () => toggleRandom())
ipcRenderer.on('shortOpacity', () => toggleOpacity())
ipcRenderer.on('shortApply', () => applyColor())

ipcRenderer.on('hasLooseFocus', (event, looseFocus) => document.querySelector('html').classList.toggle('blured', looseFocus))

ipcRenderer.on('changePosition', (event, position) => {
  if (position === 'right') document.querySelector('.toolbar').classList.add('setRight')
  else document.querySelector('.toolbar').classList.remove('setRight')
})

ipcRenderer.on('changeTypeIcons', (event, type) => cm.initButtonsType(type, 'colorpicker'))
ipcRenderer.on('changeTools', (event, tools) => {
  initTools(tools)
  initToolsEvent()
})


function initTools (tools) {
  let html = ''
  let allTools = {
    top: { title: 'Pin to Foreground', icon: 'fa-map-pin' },
    picker: { title: 'Pick Color', icon: 'fa-eyedropper' },
    tags: { title: 'Open Colorsbook', icon: 'fa-bookmark' },
    shade: { title: 'Toggle Shading', icon: 'fa-tint' },
    random: { title: 'Set Random Color', icon: 'fa-random' },
    opacity: { title: 'Toggle Opacity', icon: 'fa-sliders' },
    clean: { title: 'Clean Vue', icon: 'fa-adjust' },
    apply: { title: 'Get Clipboard\'s Colors', icon: 'fa-magic' },
    settings: { title: 'Open Settings', icon: 'fa-gear' }
  }

  for (let tool of tools) {
    html += `<p id="${tool}_button" title="${allTools[tool].title}"><i class="fa ${allTools[tool].icon}"></i></p>`
  }

  document.querySelector('#tools').innerHTML = html
}

function changeLastColor (color) {
  ipcRenderer.send('changeLastColor', color)
}

function changebuttonsPosition (pos) {
  ipcRenderer.send('buttonsPosition', pos)
}

function changebuttonsType (type) {
  ipcRenderer.send('buttonsType', type)
}

function togglePin () {
  let bool = document.querySelector('#top_button').classList.toggle('active')
  ipcRenderer.send('setOnTop', bool)
}

function toggleShading () {
  let bool = document.querySelector('#shade_button').classList.toggle('active')
  if (bool) cp.changeShading()
  cp.isShadingActive = bool
  ipcRenderer.send('shadingActive', bool)
  document.querySelector('header').classList.toggle('shading')
}

function toggleRandom () {
  const r = Math.floor(Math.random() * 255) + 0
  const g = Math.floor(Math.random() * 255) + 0
  const b = Math.floor(Math.random() * 255) + 0
  cp.setNewRGBColor([r, g, b])
}

function toggleOpacity () {
  let bool = cp.toggleOpacity()
  ipcRenderer.send('opacityActive', bool)
}

function toggleClean () {
  let bool = document.querySelector('#clean_button').classList.toggle('active')
  document.querySelector('body').classList.toggle('clean')
}

function applyColor () {
  const regex = /(#(?:[\da-f]{3}){1,2}|rgb\((?:\d{1,3},\s*){2}\d{1,3}\)|rgba\((?:\d{1,3},\s*){3}\d*\.?\d+\))/ig
  let content = clipboard.readText()
  let colors = content.replace(/\n/g, ' ').match(regex)
  colors = [...new Set(colors)]
  for(let color of colors) {
    if (color === colors[0]) cp.setNewColor(color)
    else ipcRenderer.send('openNewColor', colors)
  }
}

function initToolsEvent () {
  if (document.querySelector('#top_button')) document.querySelector('#top_button').onclick = () => togglePin()
  if (document.querySelector('#picker_button')) document.querySelector('#picker_button').onclick = () => ipcRenderer.send('launchPicker')
  if (document.querySelector('#tags_button')) document.querySelector('#tags_button').onclick = () => ipcRenderer.send('launchColorsbook')
  if (document.querySelector('#shade_button')) document.querySelector('#shade_button').onclick = () => toggleShading()
  if (document.querySelector('#random_button')) document.querySelector('#random_button').onclick = () => toggleRandom()
  if (document.querySelector('#opacity_button')) document.querySelector('#opacity_button').onclick = () => toggleOpacity()
  if (document.querySelector('#clean_button')) document.querySelector('#clean_button').onclick = () => toggleClean()
  if (document.querySelector('#apply_button')) document.querySelector('#apply_button').onclick = () => applyColor()
  if (document.querySelector('#settings_button')) document.querySelector('#settings_button').onclick = () => ipcRenderer.send('showPreferences')
}

function initEvents () {
  window.addEventListener('contextmenu', event => {
    cm.openMenu('colorpickerMenu')
  })

  document.querySelector('.toolbar').addEventListener('dblclick', function(event) {
    if (event.target !== this) return;
    ipcRenderer.send(`maximize-colorpicker`)
  })

  document.querySelector('.red_bar input').oninput = function () {
    const red = this.value
    cp.setNewRGBColor([red, cp.green, cp.blue])
  }

  document.querySelector('.green_bar input').oninput = function () {
    const green = this.value
    cp.setNewRGBColor([cp.red, green, cp.blue])
  }

  document.querySelector('.blue_bar input').oninput = function () {
    const blue = this.value
    cp.setNewRGBColor([cp.red, cp.green, blue])
  }

  document.querySelector('.alpha_bar input').oninput = function () {
    cp.setNewAlphaColor(this.value / 255)
  }

  document.querySelector('#red_value').oninput = function () {
    let red = this.value
    if (red > 255) red = 255
    if (red < 0) red = 0
    cp.setNewRGBColor([red, cp.green, cp.blue])
  }

  document.querySelector('#green_value').oninput = function () {
    let green = this.value
    if (green > 255) green = 255
    if (green < 0) green = 0
    cp.setNewRGBColor([cp.red, green, cp.blue])
  }

  document.querySelector('#blue_value').oninput = function () {
    let blue = this.value
    if (blue > 255) blue = 255
    if (blue < 0) blue = 0
    cp.setNewRGBColor([cp.red, cp.green, blue])
  }

  document.querySelector('#alpha_value').oninput = function () {
    let alpha = this.value
    if (alpha === '0.') return
    if (alpha === '1.') return cp.setNewAlphaColor(1)
    if (isNaN(alpha) || alpha.length > 4) return cp.setNewAlphaColor(0)
    if (alpha > 1) alpha = 1
    if (alpha < 0) alpha = 0
    cp.setNewAlphaColor(alpha)
  }

  document.querySelector('#hex_value').oninput = function () {
    let hex = this.value.replace('#', '')
    if (hex.length !== 6) return
    cp.setNewColor(hex)
  }

  let els = document.querySelectorAll('#red_value, #green_value, #blue_value, #hex_value')
  for (let el of els) {
    el.onfocus = function () {
      this.onkeydown = e => changeHex(e)
      this.onwheel = e => changeHex(e)

      function changeHex (e) {
        if (e.keyCode === 38 || e.deltaY < 0) {
          e.preventDefault()
          let red = (cp.red >= 255) ? 255 : cp.red + 1
          let green = (cp.green >= 255) ? 255 : cp.green + 1
          let blue = (cp.blue >= 255) ? 255 : cp.blue + 1
          return cp.setNewRGBColor([red, green, blue])
        } else if (e.keyCode === 40 || e.deltaY > 0) {
          e.preventDefault()
          let red = (cp.red <= 0) ? 0 : cp.red - 1
          let green = (cp.green <= 0) ? 0 : cp.green - 1
          let blue = (cp.blue <= 0) ? 0 : cp.blue - 1
          return cp.setNewRGBColor([red, green, blue])
        }
      }
    }
  }
}
