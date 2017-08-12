'use strict'

const robot = require('robotjs')
const {BrowserWindow} = require('electron')

module.exports = (dirname, storage) => {
  let win, colors

  let init = () => {
    if (win === null || win === undefined) {
      createWindow()
    }
  }

  let getColors = () => {
    let mouse = robot.getMousePos()
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

  let createWindow = () => {
    win = new BrowserWindow({
      frame: false,
      'auto-hide-menu-bar': true,
      width: 110,
      height: 110,
      transparent: true,
      alwaysOnTop: true,
      focusable: false,
      icon: `${dirname}/build/logo.png`
    })

    win.loadURL(`file://${dirname}/views/picker.html`)
    win.on('closed', () => {
      win = undefined
    })
  }

  let getWindow = () => win

  return {
    init: init,
    getColors: getColors,
    getWindow: getWindow
  }
}
