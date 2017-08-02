'use strict';

const storage = require('electron-json-storage');
// @TODO utiliser electron-json-storage quand async & await est possible

let settings = {};
let templateWindows = {
  'size': { 'width': 484, 'height': 190 },
  'pos': { 'x': 300, 'y': 300},
  'buttonsPosition': 'right',
  'buttonsType': 'window'
};
let templateMacOS = {
  'size': { 'width': 484, 'height': 190 },
  'pos': { 'x': 300, 'y': 300},
  'buttonsPosition': 'left',
  'buttonsType': 'osx'
};
let templaceLinux = {
  'size': { 'width': 484, 'height': 190 },
  'pos': { 'x': 300, 'y': 300},
  'buttonsPosition': 'right',
  'buttonsType': 'linux'
};

/**
 * [init - init settings]
 * @return {Promise} [promise for save/load settings]
 */
let init = name => (
  new Promise((resolve, reject) => (
    storage.has(name, (err, exist) => {
      if (err) throw err;
      if (exist) { resolve(getSettings(name)); }
      else { resolve(initDefaultSettings(name)); }
    })
  ))
);

/**
 * [getSettings - return settings]
 * @return {object} [App settings]
 */
let getSettings = name => (
  new Promise((resolve, reject) => {
    console.log('get Settings');
    storage.get(name, (err, data) => {
      if (err) throw err;
      settings = data;
      resolve(data);
    });
  })
);

/**
 * [saveSettings - save settings]
 * @param  {[type]} name   [description]
 * @param  {[type]} config [description]
 * @return {[type]}        [description]
 */
let saveSettings = (name, config) => (
  new Promise((resolve, reject) => {
    settings = config;
    storage.set(name, config, (err, data) => {
      if (err) throw err;
      resolve(true);
    });
  })
);

/**
 * [initDefaultSettings - save default settings to storage]
 * @return {Promise} [promise for save settings]
 */
let initDefaultSettings = name => {
  console.log('Init default settings');
  switch(process.platform) {
    case 'darwin': settings = templateMacOS; break;
    case 'win32': settings = templateWindows; break;
    case 'linux': settings = templaceLinux; break;
    case 'freebsd': settings = templaceLinux; break;
    case 'sunos': settings = templaceLinux; break;
    default: settings = templateMacOS; break;
  }
  return saveSettings(name, settings);
}

module.exports = {
  init: init,
  getSettings: getSettings,
  saveSettings: saveSettings
}
