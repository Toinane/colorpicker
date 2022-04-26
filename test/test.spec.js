const { _electron: electron } = require('playwright');
const { test, expect } = require('@playwright/test');

test('Application launch', async () => {
  const electronApp = await electron.launch({
    args: ['.', '--headless=true'],
  });
  const isPackaged = await electronApp.evaluate(async ({ app }) => {
    return app.isPackaged;
  });

  expect(isPackaged).toBe(false);

  const window = await electronApp.firstWindow();

  expect(await window.title()).toMatch('Colorpicker');

  await electronApp.close();
});
