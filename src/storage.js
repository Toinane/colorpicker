'use strict';

const electron_storage = require('electron-json-storage');
const {dialog} = require('electron');

let storage, template, defaultStorage;

/**
 * [init - init storage]
 * @return {Promise} [promise when initialized]
 */
let init = () => (
  new Promise((resolve, reject) => (
    electron_storage.has('colorpicker', (err, exist) => {
      if (err) throw err;
      if (exist) { resolve(fetch()); }
      else {
        storage = defaultStorage;
        resolve(save());
      }
    })
  ))
);

/**
 * [fetch - fetch storage]
 * @return {Promise} [promise when fetched]
 */
let fetch = () => (
  new Promise((resolve, reject) => {
    electron_storage.get('colorpicker', (err, data) => {
      if (err) {
        dialog.showErrorBox('loading storage file error', err);
        storage = defaultStorage;
        resolve(false);
      }
      storage = data;
      resolve(true);
    });
  })
);

/**
 * [get - return settings of target browser]
 * @param  {string} el      [element to get]
 * @param  {string} name    [name of the target browser]
 * @return {string|Object}  [settings string or object]
 */
let get = (el, name) => {
  name = name ? name : 'colorpicker';
  return storage[name][el] ? storage[name][el] : {};
}

/**
 * [add - add object settings to storage]
 * @param {Object} payload [object setting to add & save]
 * @param {string} name    [name of the target browser]
 */
let add = (payload, name) => (
  new Promise((resolve, reject) => {
    console.log('save payload:', payload);
    name = name ? name : 'colorpicker';
    Object.assign(storage[name], payload);
    resolve(save());
  })
)

/**
 * [save - save current storage]
 * @return {Promise} [promise when saved]
 */
let save = () => (
  new Promise((resolve, reject) => {
    electron_storage.set('colorpicker', storage, (err, data) => {
      if (err) throw err;
      resolve(true);
    });
  })
);

/**
 * [reset - reset storage to default]
 */
let reset = () => {
  electron_storage.remove('colorpicker');
  storage = defaultStorage;
  save();
}

/**
 * [platform - get actual platfom]
 * @return {string} [actual platform]
 */
let platform = () => {
  switch(process.platform) {
    case 'darwin':  return 'darwin';  break;
    case 'win32':   return 'windows'; break;
    case 'linux':   return 'linux';   break;
    case 'freebsd': return 'linux';   break;
    case 'sunos':   return 'linux';   break;
    default:        return 'darwin';  break;
  }
  return save(name, storage);
}

/**
 * [template - default settings for each platform]
 * @type {Object}
 */
template = {
  windows: {
    buttonsPosition: 'right',
    buttonsType: 'windows'
  },
  darwin: {
    buttonsPosition: 'left',
    'buttonsType': 'osx'
  },
  linux: {
    buttonsPosition: 'right',
    buttonsType: 'linux'
  }
};

/**
 * [defaultStorage - default storage]
 * @type {Object}
 */
defaultStorage = {
  colorpicker: {
    size: { width: 484, height: 190 },
    buttonsPosition: template[platform()]['buttonsPosition'],
    buttonsType: template[platform()]['buttonsType'],
    lastColor: '#00AEEF'
  },
  hexacolor: {},
  picker: {}
};

module.exports = {
  init: init,
  get: get,
  add: add,
  reset, reset
}
