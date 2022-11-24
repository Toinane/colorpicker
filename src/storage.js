"use strict";

const electronStorage = require("electron-json-storage");
const { dialog } = require("electron");

let storage;
let template;
let defaultStorage;

/**
 * [init - init storage]
 * @return {Promise} [promise when initialized]
 */
let init = () =>
  new Promise((resolve, reject) =>
    electronStorage.has("colorpicker", (err, exist) => {
      if (err) { throw err; }
      if (exist) { resolve(fetch()); }
      else {
        storage = defaultStorage;
        resolve(save());
      }
    })
  );

/**
 * [fetch - fetch storage]
 * @return {Promise} [promise when fetched]
 */
let fetch = () =>
  new Promise((resolve, reject) => {
    electronStorage.get("colorpicker", (err, data) => {
      if (err) {
        dialog.showErrorBox("loading storage file error", err);
        storage = defaultStorage;
        resolve(false);
      }
      storage = defaultStorage;
      for (let key in defaultStorage.colorpicker) {
        if (!data.colorpicker) { return; }
        if (!data.colorpicker.hasOwnProperty(key)) {
          data.colorpicker[key] = defaultStorage.colorpicker[key];
        }
      }
      for (let key in defaultStorage.picker) {
        if (!data.picker) { return; }
        if (!data.picker.hasOwnProperty(key)) {
          data.picker[key] = defaultStorage.picker[key];
        }
      }
      for (let key in defaultStorage.colorsbook) {
        if (!data.colorsbook) { return; }
        if (!data.colorsbook.hasOwnProperty(key)) {
          data.colorsbook[key] = defaultStorage.colorsbook[key];
        }
      }
      storage = data;
      resolve(true);
    });
  });

/**
 * [get - return settings of target browser]
 * @param  {string} el      [element to get]
 * @param  {string} name    [name of the target browser]
 * @return {string|Object}  [settings string or object]
 */
let get = (el, name) => {
  if (!name) { name = "colorpicker"; }
  return storage[name][el] !== null || storage[name][el] !== undefined
    ? storage[name][el]
    : {};
};

/**
 * [add - add object settings to storage]
 * @param {Object} payload [object setting to add & save]
 * @param {string} name    [name of the target browser]
 */
let add = (payload, name) =>
  new Promise((resolve, reject) => {
    if (!name) { name = "colorpicker"; }
    Object.assign(storage[name], payload);
    resolve(save());
  });

/**
 * [save - save current storage]
 * @return {Promise} [promise when saved]
 */
let save = () =>
  new Promise((resolve, reject) => {
    electronStorage.set("colorpicker", storage, (err, data) => {
      if (err) { throw err; }
      resolve(true);
    });
  });

/**
 * [reset - reset storage to default]
 */
let reset = () => {
  electronStorage.remove("colorpicker");
  storage = defaultStorage;
  save();
};

/**
 * [platform - get actual platfom]
 * @return {string} [actual platform]
 */
let platform = () => {
  switch (process.platform) {
    case "darwin":
      return "darwin";
    case "win32":
      return "windows";
    case "linux":
      return "linux";
    case "freebsd":
      return "linux";
    case "sunos":
      return "linux";
    default:
      return "darwin";
  }
};

/**
 * [template - default settings for each platform]
 * @type {Object}
 */
template = {
  windows: {
    buttonsPosition: "right",
    buttonsType: "windows",
  },
  darwin: {
    buttonsPosition: "left",
    buttonsType: "osx",
  },
  linux: {
    buttonsPosition: "right",
    buttonsType: "linux",
  },
};

/**
 * [defaultStorage - default storage]
 * @type {Object}
 */
defaultStorage = {
  colorpicker: {
    tools: ["top", "picker", "tags", "shade", "settings"],
    size: { width: 440, height: 150 },
    buttonsPosition: template[platform()].buttonsPosition,
    buttonsType: template[platform()].buttonsType,
    lastColor: "#00AEEF",
    history: [],
    colorfullApp: false,
  },
  colorsbook: {
    colors: {
      flat: [
        "#2196F3",
        "#00BCD4",
        "#4CAF50",
        "#8BC34A",
        "#FFEB3B",
        "#FF9800",
        "#FF5722",
        "#F44336",
        "#673AB7",
        "#3F51B5",
        "#607D8B",
      ],
      pastel: [
        "#7E93C8",
        "#8FC1E2",
        "#AFBBE3",
        "#EFCAC4",
        "#E19494",
        "#F8AF85",
        "#F9C48C",
        "#C2BB9B",
        "#B0D9CD",
        "#6B8790",
        "#AC94C9",
      ],
    },
  },
  picker: {
    realTime: true,
  },
};

module.exports = {
  init: init,
  get: get,
  add: add,
  reset: reset,
};
