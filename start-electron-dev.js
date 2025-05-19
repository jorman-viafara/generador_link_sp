// start-electron-dev.js

const getPort = require('get-port').default;
const { spawn } = require('child_process');
const waitOn = require('wait-on');
const path = require('path');

(async () => {
  const port = await getPort({ port: 3000 }); // prueba desde 3000
  const nextDev = spawn('npm', ['run', 'dev-custom', `--`, `-p`, port], {
    stdio: 'inherit',
    shell: true,
  });

  await waitOn({ resources: [`http://localhost:${port}`], timeout: 20000 });

  const electron = spawn('electron', ['.', port], {
    stdio: 'inherit',
    shell: true,
  });

  // Limpiar procesos si se cierra uno
  electron.on('close', () => nextDev.kill('SIGTERM'));
})();
