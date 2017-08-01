'use strict';

const storage = require('electron-storage');
// @TODO utiliser electron-json-storage quand async & await est possible

let settings = {};

/**
 * [getSettings - return settings]
 * @return {object} [App settings]
 */
let getSettings = name => storage.get(name);

let saveSettings = (name, config) => {
  settings = config;
  return storage.set(name, config);
}

/**
 * [init - init settings]
 * @return {Promise} [promise for save/load settings]
 */
let init = name => (
  new Promise((resolve, reject) => (
    storage.isPathExists(name)
    .then(result => {
      if (result) { resolve(initStorage(name)); }
      else { resolve(initDefaultSettings(name)); }
    })
    .catch(err => reject(err))
  ))
);

/**
 * [initStorage - load settings from storage]
 * @return {Promise} [promise for load settings]
 */
let checkStorage = name => {
  console.log('init storage');
  return storage.get(name).then(result => {
    settings = result;
  });
}

/**
 * [initDefaultSettings - save default settings to storage]
 * @return {Promise} [promise for save settings]
 */
let initDefaultSettings = name => {
  console.log('init default settings');
  switch(process.platform) {
    case 'darwin': settings = templateMacOS; break;
    case 'win32': settings = templateWindows; break;
    case 'linux': settings = templaceLinux; break;
    case 'freebsd': settings = templaceLinux; break;
    case 'sunos': settings = templaceLinux; break;
    default: settings = templateMacOS; break;
  }
  return storage.set(name, settings);
}

let templateWindows = {
  'size': { 'width': 484, 'height': 190 },
  'buttonsPosition': 'right',
  'buttonsType': 'window'
};

let templateMacOS = {
  'size': { 'width': 484, 'height': 190 },
  'buttonsPosition': 'left',
  'buttonsType': 'osx'
};

let templaceLinux = {
  'size': { 'width': 484, 'height': 190 },
  'buttonsPosition': 'right',
  'buttonsType': 'linux'
};

module.exports = {
  init: init,
  getSettings: getSettings,
  saveSettings: saveSettings
}
