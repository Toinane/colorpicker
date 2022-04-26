const { spawn } = require('child_process');
const kill = require('tree-kill-promise');

module.exports = class ElectronReloadPlugin {
  electronProcess;

  apply(compiler) {
    compiler.hooks.done.tap('electron-reload-plugin', async () => {
      if (!this.electronProcess) {
        this.startElectron();
      } else {
        await kill(this.electronProcess.pid);
      }
    });
  }

  startElectron() {
    this.electronProcess = spawn(
      'electron',
      ['--inspect=5858', '--remote-debugging-port=5959', './dist/main.js'],
      {
        shell: true,
        env: {
          NODE_ENV: 'development',
        },
        stdio: 'inherit',
      },
    )
      .on('message', (message) => console.log('[LOG]', message))
      .on('error', (childError) => console.error('[ERR]', childError))
      .on('close', (code) => {
        if (code === 1) {
          this.startElectron();
        } else {
          process.exit(code);
        }
      });
  }
};
