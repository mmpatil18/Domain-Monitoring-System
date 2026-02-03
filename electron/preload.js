const { contextBridge, ipcRenderer } = require('electron');

/**
 * Preload script - runs in renderer process before web content loads
 * Exposes safe APIs to the frontend while maintaining security
 */

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Get application version
    getVersion: () => ipcRenderer.invoke('get-version'),

    // Get application path
    getAppPath: () => ipcRenderer.invoke('get-app-path'),

    // Show desktop notification
    showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),

    // Check if running in Electron
    isElectron: true,

    // Platform information
    platform: process.platform
});

// Set a flag that the frontend can check
window.isElectronApp = true;

console.log('Preload script loaded - Electron API exposed');
