'use strict';

const { ipcMain } = require('electron');
const robot = require('robotjs');

let size, mouse, mouseEvent, color;

module.exports = (storage, browsers) => {
    const { picker, colorpicker } = browsers;

    let closePicker = newColor => {
        if (typeof newColor !== 'string') newColor = color;
        if (picker.getWindow()) {
            picker.getWindow().close();
            colorpicker.getWindow().webContents.send('changeColor', newColor);
            colorpicker.getWindow().focus();
            ipcMain.removeListener('closePicker', closePicker);
            ipcMain.removeListener('pickerRequested', event => {});
        }
    };

    ipcMain.on('pickerRequested', event => {
        let realtime = storage.get('realtime', 'picker');

        if (process.platform === 'darwin') mouseEvent = require('osx-mouse')();
        // if (process.platform === 'linux') mouseEvent = require('linux-mouse')()
        if (process.platform === 'win32') mouseEvent = require('win-mouse')();
        color = storage.get('lastColor');

        picker.getWindow().on('close', () => mouseEvent.destroy());

        mouseEvent.on('move', (x, y) => {
            let color = '#' + robot.getPixelColor(parseInt(x), parseInt(y));
            picker.getWindow().setPosition(parseInt(x) - 50, parseInt(y) - 50);
            picker.getWindow().webContents.send('updatePicker', color);
            if (realtime)
                colorpicker.getWindow().webContents.send('previewColor', color);
        });

        mouseEvent.on('left-up', (x, y) => {
            closePicker('#' + robot.getPixelColor(parseInt(x), parseInt(y)));
        });

        let pos = robot.getMousePos();
        picker
            .getWindow()
            .setPosition(parseInt(pos.x) - 50, parseInt(pos.y) - 50);

        picker
            .getWindow()
            .webContents.send(
                'updatePicker',
                robot.getPixelColor(pos.x, pos.y)
            );

        ipcMain.on('closePicker', closePicker);
        mouseEvent.on('right-up', closePicker);
    });
};
