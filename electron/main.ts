import { app } from 'electron';

import createWindow from './windows/colorpicker';

app.commandLine.appendSwitch('force-color-profile', 'srgb'); // generic-rgb & macos only
app.disableDomainBlockingFor3DAPIs();
app.disableHardwareAcceleration();

app.on('ready', createWindow);
