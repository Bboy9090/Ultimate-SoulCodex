// electron-main.cjs
// SoulCodex desktop wrapper

const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let serverProcess = null;
const API_PORT = process.env.PORT || 3000;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Point Electron at your REST UI (or whatever frontend uses this API)
  win.loadURL(`http://localhost:${API_PORT}/`);

  win.on('closed', () => {
    // When the window closes, kill the API server too
    if (serverProcess) {
      serverProcess.kill();
      serverProcess = null;
    }
  });
}

function startServer() {
  // Run: node dist/index.js
  const distPath = path.join(__dirname, 'dist', 'index.js');

  serverProcess = spawn('node', [distPath], {
    cwd: __dirname,
    shell: false,
  });

  serverProcess.stdout.on('data', (data) => {
    console.log('[API]', data.toString().trim());
  });

  serverProcess.stderr.on('data', (data) => {
    console.error('[API ERROR]', data.toString().trim());
  });

  serverProcess.on('exit', (code) => {
    console.log('[API] exited with code', code);
  });
}

app.whenReady().then(() => {
  startServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) {
      serverProcess.kill();
      serverProcess = null;
    }
    app.quit();
  }
});
