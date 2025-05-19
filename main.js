const { app, BrowserWindow } = require('electron');

const port = process.argv[2] || 3000;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadURL(`http://localhost:${port}`);
  win.webContents.openDevTools(); // opcional
}

app.whenReady().then(createWindow);
