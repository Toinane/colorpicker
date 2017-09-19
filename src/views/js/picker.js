const {screen} = require('electron')
const robot = require('robotjs')

let pixels = 5
let colors = {}
let color = new Color(0, 0, 0)
let size = screen.getPrimaryDisplay().workAreaSize

document.addEventListener('DOMContentLoaded', () => ipcRenderer.send('picker-requested'), false)

ipcRenderer.on('picker-size', (event, size) => {
  pixels = size
})

// setInterval(() => {
  let table = ''
  let half = Math.floor(pixels / 2)
  getColors(pixels, half)
  for(let y = 0; y < pixels; y++) {
    table += '<div class="outbox">'
    for(let x = 0; x < pixels; x++) {
      if (x === half && y === half) {
        color.setColorFromHex(colors[`#l${y}-${x}`])
        document.querySelector('#border').style.border = `9px solid ${colors[`#l${y}-${x}`]}`
        if (color.isDarkColor()) table += `<div class="box" id="l${y}-${x}" style="border: 1px solid white; background: ` + colors[`#l${y}-${x}`] + '"></div>'
        else table += `<div class="box" id="l${y}-${x}" style="border: 1px solid black; background: ` + colors[`#l${y}-${x}`] + '"></div>'
      }
      else if (x === half - 1 && y === half) {
        color.setColorFromHex(colors[`#l${half}-${half}`])
        document.querySelector('#border').style.border = `9px solid ${colors[`#l${y}-${x}`]}`
        if (color.isDarkColor()) table += `<div class="box" id="l${y}-${x}" style="border-right: 1px solid white; background: ` + colors[`#l${y}-${x}`] + '"></div>'
        else table += `<div class="box" id="l${y}-${x}" style="border-right: 1px solid black; background: ` + colors[`#l${y}-${x}`] + '"></div>'
      }
      else if (x === half && y === half - 1) {
        color.setColorFromHex(colors[`#l${half}-${half}`])
        document.querySelector('#border').style.border = `9px solid ${colors[`#l${y}-${x}`]}`
        if (color.isDarkColor()) table += `<div class="box" id="l${y}-${x}" style="border-bottom: 1px solid white; background: ` + colors[`#l${y}-${x}`] + '"></div>'
        else table += `<div class="box" id="l${y}-${x}" style="border-bottom: 1px solid black; background: ` + colors[`#l${y}-${x}`] + '"></div>'
      }
      else table += `<div class="box" id="l${y}-${x}" style="background: ` + colors[`#l${y}-${x}`] + '"></div>'
    }
    table += '</div>'
  }
  document.querySelector('#grid').innerHTML = table
// }, 1)

function getColors (size, half) {
  let mouse = robot.getMousePos()
  if (mouse.x <= half || mouse.x >= size.width - half) return colors
  if (mouse.y <= half || mouse.y >= size.height) return colors
  for(let y = 0, halfY = -half; y < size; y++) {
    for(let x = 0, halfX = -half; x < size; x++) {
      colors[`#l${y}-${x}`] = '#' + robot.getPixelColor(mouse.x + halfX, mouse.y + halfY)
      halfX++;
    }
    halfY++;
  }
  return colors
}
