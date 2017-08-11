let color = new Color(0, 0, 0)

document.addEventListener('DOMContentLoaded', () => ipcRenderer.send('init-picker'), false)

ipcRenderer.on('new-colors', (event, colors) => {
  Object.keys(colors).map((key, index) => {
    color.setColorFromHex('#' + colors[key])
    // if (key === '#l2-2') document.querySelector(key).style.border = '1px solid ' + color.getHexFromRGB(color.getNegativeColor(color.rgb))
    if (color.isDarkColor() && key === '#l2-2') document.querySelector(key).style.border = '1px solid white'
    else if (key === '#l2-2') document.querySelector(key).style.border = '1px solid black'
    document.querySelector(key).style.background = color.hex
  })
})
