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
let monitoringPaused = false;

const isDev = process.argv.includes('--dev') || !app.isPackaged;
console.log('--------------------------------------------------');
console.log('DEBUG: isDev calculation:');
console.log('  process.argv:', process.argv);
console.log('  includes --dev:', process.argv.includes('--dev'));
console.log('  !app.isPackaged:', !app.isPackaged);
console.log('  RESULT isDev:', isDev);
console.log('--------------------------------------------------');
const API_PORT = 5000;
const API_URL = `http://127.0.0.1:${API_PORT}`;

/**
 * Get preferences file path
 */
function getPreferencesPath() {
    const userDataPath = app.getPath('userData');
    return path.join(userDataPath, 'preferences.json');
}

/**
 * Get user preference from local file
 */
async function getUserPreference() {
    try {
        const prefsPath = getPreferencesPath();

        if (!fs.existsSync(prefsPath)) {
            return null; // No preference file = first time
        }

        const data = fs.readFileSync(prefsPath, 'utf8');
        const prefs = JSON.parse(data);
        return prefs.minimize_on_close; // "true", "false", or undefined
    } catch (error) {
        console.error('Error reading preference:', error.message);
        return null;
    }
}

/**
 * Save user preference to local file
 */
async function saveUserPreference(minimize) {
    try {
        const prefsPath = getPreferencesPath();
        const prefs = {
            minimize_on_close: minimize ? 'true' : 'false',
            updated_at: new Date().toISOString()
        };

        fs.writeFileSync(prefsPath, JSON.stringify(prefs, null, 2), 'utf8');
        console.log('Preference saved to:', prefsPath);
        console.log('Value:', minimize ? 'minimize' : 'quit');
    } catch (error) {
        console.error('Error saving preference:', error.message);
    }
}

/**
 * Show dialog asking user about background running
 */
function showCloseDialog() {
    const choice = dialog.showMessageBoxSync(mainWindow, {
        type: 'question',
        buttons: ['Minimize to Tray', 'Quit Completely'],
        defaultId: 0,
        title: 'Keep Domain Monitor Running?',
        message: 'Do you want Domain Monitor to keep running in the background?',
        detail: 'The app will continue monitoring domains even when the window is closed.\n\n✓ Icon stays in system tray\n✓ Monitoring continues\n✓ Email alerts active',
        checkboxLabel: "Remember my choice",
        checkboxChecked: false
    });

    console.log('=== DIALOG DEBUG ===');
    console.log('Dialog result type:', typeof choice);
    console.log('Dialog result value:', choice);
    console.log('Dialog result JSON:', JSON.stringify(choice));
    console.log('===================');

    // showMessageBoxSync returns just the button index (number)
    // 0 = Minimize to Tray, 1 = Quit Completely
    return {
        minimize: choice === 0,
        remember: false  // Checkbox not supported in sync version
    };
}

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
        env: { ...(process.env || {}), PYTHONUNBUFFERED: '1' }
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
 * Pause monitoring service
 */
function pauseMonitoring() {
    if (pythonMonitorProcess) {
        pythonMonitorProcess.kill();
        pythonMonitorProcess = null;
        monitoringPaused = true;
        updateTrayMenu();
        console.log('Monitoring paused');
    }
}

/**
 * Resume monitoring service
 */
function resumeMonitoring() {
    if (!pythonMonitorProcess) {
        startPythonMonitor();
        monitoringPaused = false;
        updateTrayMenu();
        console.log('Monitoring resumed');
    }
}

/**
 * Update tray menu to reflect current state
 */
function updateTrayMenu() {
    if (!tray) return;

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
            label: monitoringPaused ? '▶ Resume Monitoring' : '⏸ Pause Monitoring',
            click: () => {
                if (monitoringPaused) {
                    resumeMonitoring();
                } else {
                    pauseMonitoring();
                }
            }
        },
        {
            label: 'Restart Monitoring',
            click: () => {
                if (pythonMonitorProcess) {
                    pythonMonitorProcess.kill();
                }
                setTimeout(() => {
                    startPythonMonitor();
                    monitoringPaused = false;
                    updateTrayMenu();
                }, 1000);
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

    tray.setContextMenu(contextMenu);
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
    mainWindow.on('close', async (event) => {
        if (app.isQuitting) {
            return; // Allow quit
        }

        event.preventDefault();

        // Get saved preference
        const preference = await getUserPreference();

        if (preference === null || preference === undefined || preference === 'null') {
            // First time or no preference - show dialog
            const choice = showCloseDialog();

            // Save if user wants to remember (non-blocking)
            if (choice.remember) {
                saveUserPreference(choice.minimize).catch(err => {
                    console.warn('Could not save preference:', err.message);
                });
            }

            if (choice.minimize) {
                console.log('Minimizing to tray...');
                console.log('  Tray exists before hide:', !!tray);
                console.log('  Window will hide now');
                mainWindow.hide();
                console.log('  Window hidden successfully');
                console.log('  Tray still exists:', !!tray);
            } else {
                console.log('Quitting app...');
                app.isQuitting = true;
                app.quit();
            }
        } else if (preference === 'true') {
            // User wants to minimize
            console.log('Using saved preference: minimize to tray');
            console.log('  About to hide window');
            mainWindow.hide();
            console.log('  Window hidden, returning from close handler');
        } else {
            // User wants to quit
            console.log('Using saved preference: quit');
            app.isQuitting = true;
            app.quit();
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
    const trayIconPath = getIconPath();

    // Check if icon exists
    if (!fs.existsSync(trayIconPath)) {
        console.error('Tray icon not found:', trayIconPath);
        return;
    }

    tray = new Tray(trayIconPath);
    tray.setToolTip('Domain Monitor');

    // Initial menu creation
    updateTrayMenu();

    // Double-click to show window
    tray.on('double-click', () => {
        if (mainWindow) {
            mainWindow.show();
        }
    });

    console.log('System tray created');
}

/**
 * Stop all Python processes forcefully
 */
function stopPythonProcesses() {
    console.log('Stopping Python processes...');

    const killProcess = (proc) => {
        if (!proc) return;
        try {
            if (process.platform === 'win32') {
                // Windows: Kill process tree forcefully
                // /F = Force, /T = Tree (kill children), /PID = Process ID
                spawn('taskkill', ['/pid', proc.pid, '/f', '/t']);
            } else {
                proc.kill('SIGKILL');
            }
        } catch (e) {
            console.error('Error killing process:', e);
            proc.kill(); // Fallback
        }
    };

    if (pythonApiProcess) {
        killProcess(pythonApiProcess);
        pythonApiProcess = null;
    }

    if (pythonMonitorProcess) {
        killProcess(pythonMonitorProcess);
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
    console.log('🔔 window-all-closed event fired');
    console.log('  Tray exists:', !!tray);
    console.log('  app.isQuitting:', app.isQuitting);

    // Don't quit if tray icon exists (running in background)
    // Only quit if user explicitly chose to quit or no tray
    if (!tray || app.isQuitting) {
        console.log('  → Quitting app');
        app.quit();
    } else {
        console.log('  → Keeping app running in background');
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    } else {
        mainWindow.show();
    }
});

app.on('before-quit', (event) => {
    console.log('⚠️ before-quit event fired');
    console.log('  app.isQuitting:', app.isQuitting);
    console.log('  Tray exists:', !!tray);
    app.isQuitting = true;
    stopPythonProcesses();
});

app.on('will-quit', (event) => {
    console.log('⚠️ will-quit event fired');
    stopPythonProcesses();

    // Final safety net: Kill any lingering processes by name
    if (process.platform === 'win32') {
        spawn('taskkill', ['/IM', 'domain-monitor-api.exe', '/F']);
        spawn('taskkill', ['/IM', 'domain-monitor.exe', '/F']);
    }
});

app.on('quit', () => {
    console.log('⚠️ quit event fired - app is quitting');
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
