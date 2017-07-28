'use strict';

const {app, Menu} = require('electron')
const BrowserWindow = require('electron').BrowserWindow;
const path = require('path');

let win, tray;
