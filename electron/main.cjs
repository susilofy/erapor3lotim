const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: 'Aplikasi Rapor SD Negeri 3 Loloan Timur',
    backgroundColor: '#f8fafc',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
      sandbox: true,
    },
    icon: path.join(__dirname, '../public/favicon.ico'),
    autoHideMenuBar: false,
  });

  // Buat menu aplikasi yang praktis untuk guru
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Cetak Dokumen (Print)',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            mainWindow.webContents.print({ silent: false, printBackground: true });
          },
        },
        { type: 'separator' },
        {
          label: 'Keluar',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'Tampilan',
      submenu: [
        { label: 'Muat Ulang (Reload)', role: 'reload' },
        { label: 'Paksa Muat Ulang', role: 'forceReload' },
        { type: 'separator' },
        { label: 'Perbesar Layar', role: 'zoomIn' },
        { label: 'Perkecil Layar', role: 'zoomOut' },
        { label: 'Ukuran Standar', role: 'resetZoom' },
        { type: 'separator' },
        { label: 'Layar Penuh (Full Screen)', role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Bantuan',
      submenu: [
        {
          label: 'Developer: Susilo Fitri Yatmoko',
          enabled: false,
        },
        {
          label: 'Instansi: SD Negeri 3 Loloan Timur',
          enabled: false,
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Muat file index.html dari folder dist
  const distPath = path.join(__dirname, '../dist/index.html');
  mainWindow.loadFile(distPath).catch(() => {
    // Jika belum di-build, muat server dev jika ada
    mainWindow.loadURL('http://localhost:3000');
  });

  // Buka tautan eksternal di browser default Windows
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
