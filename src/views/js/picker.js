const {screen} = require('electron')
const robot = require('robotjs')
let colors
let color = new Color(0, 0, 0)
let size = screen.getPrimaryDisplay().workAreaSize

document.addEventListener('DOMContentLoaded', () => ipcRenderer.send('picker-requested'), false)

setInterval(() => {
  getColors()
  document.querySelector('#border').style.border = `9px solid #${colors['#l2-2']}`
  Object.keys(colors).map((key, index) => {
    color.setColorFromHex('#' + colors[key])
    // if (key === '#l2-2') document.querySelector(key).style.border = '1px solid ' + color.getHexFromRGB(color.getNegativeColor(color.rgb))
    if (color.isDarkColor() && key === '#l2-2') document.querySelector(key).style.border = '1px solid white'
    else if (key === '#l2-2') document.querySelector(key).style.border = '1px solid black'
    document.querySelector(key).style.background = color.hex
  })
}, 1)

function getColors () {
  let mouse = robot.getMousePos()
  if (mouse.x <= 2 || mouse.x >= size.width - 2) return colors
  if (mouse.y <= 2 || mouse.y >= size.height) return colors

  colors = {
    '#l0-0': robot.getPixelColor(mouse.x-2, mouse.y-2),
    '#l0-1': robot.getPixelColor(mouse.x-1, mouse.y-2),
    '#l0-2': robot.getPixelColor(mouse.x, mouse.y-2),
    '#l0-3': robot.getPixelColor(mouse.x+1, mouse.y-2),
    '#l0-4': robot.getPixelColor(mouse.x+2, mouse.y-2),
    '#l1-0': robot.getPixelColor(mouse.x-2, mouse.y-1),
    '#l1-1': robot.getPixelColor(mouse.x-1, mouse.y-1),
    '#l1-2': robot.getPixelColor(mouse.x, mouse.y-1),
    '#l1-3': robot.getPixelColor(mouse.x+1, mouse.y-1),
    '#l1-4': robot.getPixelColor(mouse.x+2, mouse.y-1),
    '#l2-0': robot.getPixelColor(mouse.x-2, mouse.y),
    '#l2-1': robot.getPixelColor(mouse.x-1, mouse.y),
    '#l2-2': robot.getPixelColor(mouse.x, mouse.y),
    '#l2-3': robot.getPixelColor(mouse.x+1, mouse.y),
    '#l2-4': robot.getPixelColor(mouse.x+2, mouse.y),
    '#l3-0': robot.getPixelColor(mouse.x-2, mouse.y+1),
    '#l3-1': robot.getPixelColor(mouse.x-1, mouse.y+1),
    '#l3-2': robot.getPixelColor(mouse.x, mouse.y+1),
    '#l3-3': robot.getPixelColor(mouse.x+1, mouse.y+1),
    '#l3-4': robot.getPixelColor(mouse.x+2, mouse.y+1),
    '#l4-0': robot.getPixelColor(mouse.x-2, mouse.y+2),
    '#l4-1': robot.getPixelColor(mouse.x-1, mouse.y+2),
    '#l4-2': robot.getPixelColor(mouse.x, mouse.y+2),
    '#l4-3': robot.getPixelColor(mouse.x+1, mouse.y+2),
    '#l4-4': robot.getPixelColor(mouse.x+2, mouse.y+2)
  }
  return colors
}
