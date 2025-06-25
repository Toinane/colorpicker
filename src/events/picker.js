'use strict';

const { ipcMain, screen } = require('electron');
const robot = require('robotjs');

let mouseEvent;
let color;
let lastUpdateTime;

module.exports = (storage, browsers) => {
	const { picker, colorpicker } = browsers;
	const windowDestroyDelay = 100;
	const pickerUpdateDelay = 25;

	let closePicker = (newColor) => {
		if (typeof newColor !== 'string') {
			newColor = color;
		}

		const pickerWindow = picker.getWindow();

		if (pickerWindow) {
			mouseEvent.removeListener('move', mouseMoveEvent);
			mouseEvent.removeListener('left-up', leftClickEvent);
			mouseEvent.removeListener('right-up', closePicker);
			colorpicker.getWindow().webContents.send('changeColor', newColor);
			colorpicker.getWindow().focus();
			ipcMain.removeListener('closePicker', closePicker);

			setTimeout(() => {
				if (pickerWindow && !pickerWindow.isDestroyed()) {
					pickerWindow.destroy();
				}
			}, windowDestroyDelay);
		}
	};

	const linuxSupport = () => {
		const ioHook = require('iohook');

		ioHook.start();

		ioHook.on('mousemove', (event) => {
			if (!picker.getWindow()) {
				return;
			}

			picker.getWindow().setPosition(parseInt(x) - 50, parseInt(y) - 50);

			if (!lastUpdateTime || Date.now() - lastUpdateTime > pickerUpdateDelay) {
				let realtime = storage.get('realtime', 'picker');
				let { x, y } = event;
				let color = `#${robot.getPixelColor(parseInt(x), parseInt(y))}`;
				picker.getWindow().webContents.send('updatePicker', color);
				if (realtime) {
					colorpicker.getWindow().webContents.send('previewColor', color);
				}
			}
		});

		ioHook.on('mouseup', (event) => {
			if (!picker.getWindow()) {
				return;
			}
			if (event.button === 2) {
				return closePicker();
			}
			let { x, y } = event;
			closePicker(`#${robot.getPixelColor(parseInt(x), parseInt(y))}`);
		});

		let pos = robot.getMousePos();
		picker.getWindow().setPosition(parseInt(pos.x) - 50, parseInt(pos.y) - 50);

		picker
			.getWindow()
			.webContents.send('updatePicker', robot.getPixelColor(pos.x, pos.y));

		ipcMain.on('closePicker', closePicker);
	};

	ipcMain.on('pickerRequested', (event) => {
		if (process.platform !== 'darwin' && process.platform !== 'win32') {
			return linuxSupport();
		}

		if (process.platform === 'darwin') {
			mouseEvent = require('osx-mouse')();
		}

		if (process.platform === 'win32') {
			mouseEvent = require('win-mouse')();
		}
		color = storage.get('lastColor');

		const pos = screen.getCursorScreenPoint();
		picker.getWindow().setPosition(pos.x - 50, pos.y - 50);

		picker
			.getWindow()
			.webContents.send('updatePicker', robot.getPixelColor(pos.x, pos.y));

		picker.getWindow().on('closed', () => mouseEvent.destroy());
		mouseEvent.on('move', mouseMoveEvent);
		mouseEvent.on('left-up', leftClickEvent);
		ipcMain.on('closePicker', closePicker);
		mouseEvent.on('right-up', closePicker);
	});

	const mouseMoveEvent = (x, y) => {
		const positionScreen = screen.getCursorScreenPoint();
		picker
			.getWindow()
			.setPosition(positionScreen.x - 50, positionScreen.y - 50);

		if (!lastUpdateTime || Date.now() - lastUpdateTime > pickerUpdateDelay) {
			let realtime = storage.get('realtime', 'picker');
			let color = `#${robot.getPixelColor(parseInt(x), parseInt(y))}`;
			picker.getWindow().webContents.send('updatePicker', color);
			if (realtime) {
				colorpicker.getWindow().webContents.send('previewColor', color);
			}
			lastUpdateTime = Date.now();
		}
	};

	const leftClickEvent = (x, y) => {
		closePicker(`#${robot.getPixelColor(parseInt(x), parseInt(y))}`);
	};
};
