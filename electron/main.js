const { app, BrowserWindow, Tray, Menu, ipcMain, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Handle Squirrel events on Windows
if (require('electron-squirrel-startup')) {
    app.quit();
}

let mainWindow = null;
let tray = null;
let pythonApiProcess = null;
let pythonMonitorProcess = null;
let serverReady = false;

const isDev = process.argv.includes('--dev') || !app.isPackaged;
const API_PORT = 5000;
const API_URL = `http://localhost:${API_PORT}`;

/**
 * Get the executable path for a specific service
 * @param {string} type - 'api' or 'service'
 */
function getExecutablePath(type) {
    if (isDev) {
        // Development mode - use venv Python
        const venvPath = path.join(__dirname, '..', 'venv');
        let pythonPath;

        if (process.platform === 'win32') {
            pythonPath = path.join(venvPath, 'Scripts', 'python.exe');
        } else {
            pythonPath = path.join(venvPath, 'bin', 'python3');
        }

        // Return python path (or system python fallback)
        if (fs.existsSync(pythonPath)) {
            return pythonPath;
        } else {
            console.error('Virtual environment not found, falling back to system python');
            return process.platform === 'win32' ? 'python' : 'python3';
        }
    } else {
        // Production mode - use bundled executable
        // Path: resources/python/domain-monitor-{type}/domain-monitor-{type}[.exe]
        const appName = `domain-monitor-${type}`;
        const resourcesPath = path.join(process.resourcesPath, 'python');

        let execPath;
        if (process.platform === 'win32') {
            execPath = path.join(resourcesPath, appName, `${appName}.exe`);
        } else {
            execPath = path.join(resourcesPath, appName, appName);
        }

        return execPath;
    }
}


/**
 * Get the backend directory path
 */
function getBackendPath() {
    if (isDev) {
        return path.join(__dirname, '..', 'backend');
    } else {
        // In production, we don't necessarily need CWD to be the script dir 
        // if using PyInstaller, but keeping it consistent is good.
        // However, PyInstaller apps unpack to a temp dir (_MEI...).
        // We can just use the bundle dir as CWD.
        return path.join(process.resourcesPath, 'python', 'domain-monitor-api');
    }
}

/**
 * Start Python Flask API server
 */
function startPythonAPI() {
    return new Promise((resolve, reject) => {
        const execPath = getExecutablePath('api');

        // Args: In dev, pass script path. In prod, no args (executable IS the script).
        let args = [];
        let cwd;
        let stderrOutput = ''; // Capture stderr

        if (isDev) {
            const backendPath = path.join(__dirname, '..', 'backend');
            const apiScript = path.join(backendPath, 'api.py');
            args = [apiScript];
            cwd = backendPath;
        } else {
            // Production
            cwd = path.dirname(execPath);
        }

        console.log('Starting Python API server...');
        console.log('Executable:', execPath);

        pythonApiProcess = spawn(execPath, args, {
            cwd: cwd,
            env: { ...process.env, PYTHONUNBUFFERED: '1' }
        });

        pythonApiProcess.stdout.on('data', (data) => {
            const output = data.toString();
            console.log('[Python API]:', output);

            // Check if server is ready
            if (output.includes('Running on') || output.includes('WARNING')) {
                serverReady = true;
                resolve();
            }
        });

        pythonApiProcess.stderr.on('data', (data) => {
            const output = data.toString();
            stderrOutput += output; // Accumulate error output
            console.error('[Python API Error]:', output);

            // Flask outputs "Running on" and "WARNING" to stderr, so check here too
            if (!serverReady && (output.includes('Running on') || output.includes('Debugger is active'))) {
                console.log('Server detected as ready from stderr output');
                serverReady = true;
                resolve();
            }
        });

        pythonApiProcess.on('close', (code) => {
            console.log(`Python API process exited with code ${code}`);
            if (!serverReady) {
                reject(new Error(`Python API failed to start with code ${code}.\n\nError Output:\n${stderrOutput.slice(-1000)}`));
            }
        });

        pythonApiProcess.on('error', (err) => {
            console.error('Failed to start Python API:', err);
            reject(err);
        });

        // Timeout after 30 seconds if server doesn't start
        setTimeout(() => {
            if (!serverReady) {
                console.error('Python server did not respond within 30 seconds');
                reject(new Error('Python API server timeout - Flask may still be starting'));
            }
        }, 30000);
    });
}

/**
 * Start Python monitoring service
 */
function startPythonMonitor() {
    const execPath = getExecutablePath('service');

    let args = [];
    let cwd;

    if (isDev) {
        const backendPath = path.join(__dirname, '..', 'backend');
        const monitorScript = path.join(backendPath, 'monitor_service.py');
        args = [monitorScript];
        cwd = backendPath;
    } else {
        cwd = path.dirname(execPath);
    }

    console.log('Starting Python monitoring service...');
    console.log('Executable:', execPath);

    pythonMonitorProcess = spawn(execPath, args, {
        cwd: cwd,
        env: { ...process.env, PYTHONUNBUFFERED: '1' }
    });

    pythonMonitorProcess.stdout.on('data', (data) => {
        console.log('[Python Monitor]:', data.toString());
    });

    pythonMonitorProcess.stderr.on('data', (data) => {
        console.error('[Python Monitor Error]:', data.toString());
    });

    pythonMonitorProcess.on('close', (code) => {
        console.log(`Python monitor process exited with code ${code}`);
    });
}

/**
 * Create the main application window
 */
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        icon: getIconPath(),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
        title: 'Domain Monitor',
        show: false // Don't show until ready
    });

    // Load the web interface
    mainWindow.loadURL(API_URL);

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Handle window close
    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Open DevTools in development mode
    // if (isDev) {
    //     mainWindow.webContents.openDevTools();
    // }
}

/**
 * Get the icon path for the current platform
 */
function getIconPath() {
    // In both dev and prod, resources are relative to the app root
    // independent of whether we are in ASAR or not, as 'resources' is in 'files'
    const resourcesPath = path.join(__dirname, '..', 'resources');

    if (process.platform === 'win32') {
        return path.join(resourcesPath, 'icon.ico');
    } else if (process.platform === 'darwin') {
        return path.join(resourcesPath, 'icon.icns');
    } else {
        return path.join(resourcesPath, 'icon.png');
    }
}

/**
 * Create system tray icon
 */
function createTray() {
    // Use the correctly resolved icon path
    const trayIconPath = getIconPath();

    tray = new Tray(trayIconPath);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show Domain Monitor',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                }
            }
        },
        {
            label: 'Open in Browser',
            click: () => {
                require('electron').shell.openExternal(API_URL);
            }
        },
        { type: 'separator' },
        {
            label: 'Restart Monitoring',
            click: () => {
                if (pythonMonitorProcess) {
                    pythonMonitorProcess.kill();
                }
                setTimeout(() => startPythonMonitor(), 1000);
            }
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                app.isQuitting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip('Domain Monitor');
    tray.setContextMenu(contextMenu);

    // Double click to show window
    tray.on('double-click', () => {
        mainWindow.show();
    });
}

/**
 * Stop all Python processes
 */
function stopPythonProcesses() {
    console.log('Stopping Python processes...');

    if (pythonApiProcess) {
        pythonApiProcess.kill();
        pythonApiProcess = null;
    }

    if (pythonMonitorProcess) {
        pythonMonitorProcess.kill();
        pythonMonitorProcess = null;
    }
}

/**
 * Initialize the application
 */
async function initialize() {
    try {
        // Start Python API server
        await startPythonAPI();
        console.log('Python API server started successfully');

        // Wait a bit for the server to be fully ready
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Create the main window
        createWindow();

        // Create system tray
        createTray();

        // Start monitoring service
        startPythonMonitor();

    } catch (error) {
        console.error('Failed to initialize application:', error);

        dialog.showErrorBox(
            'Startup Error',
            `Failed to start Domain Monitor:\n\n${error.message}\n\nPlease check that all dependencies are installed.`
        );

        app.quit();
    }
}

// App event handlers
app.whenReady().then(initialize);

app.on('window-all-closed', () => {
    // On macOS, keep app running even when windows are closed
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    } else {
        mainWindow.show();
    }
});

app.on('before-quit', () => {
    app.isQuitting = true;
    stopPythonProcesses();
});

app.on('will-quit', () => {
    stopPythonProcesses();
});

// IPC handlers
ipcMain.handle('get-version', () => {
    return app.getVersion();
});

ipcMain.handle('get-app-path', () => {
    return app.getAppPath();
});

ipcMain.handle('show-notification', (event, title, body) => {
    const { Notification } = require('electron');

    if (Notification.isSupported()) {
        new Notification({
            title: title,
            body: body,
            icon: getIconPath()
        }).show();
    }
});
