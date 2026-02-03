const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist-electron');

console.log('🧹 Cleaning up build artifacts...');

// 1. Kill Processes (Windows specific mainly)
if (process.platform === 'win32') {
    const processesToKill = [
        "Domain Monitor.exe",
        "Domain Monitor-Setup-1.0.0.exe",
        "Domain Monitor System.exe" // sometimes the name might vary in task manager
    ];

    console.log('  🔪 Killing running processes...');

    processesToKill.forEach(proc => {
        try {
            execSync(`taskkill /F /IM "${proc}" /T`, { stdio: 'ignore' });
            console.log(`     Terminated ${proc}`);
        } catch (e) {
            // Process not running, ignore
        }
    });

    // Give OS a moment to release locks
    try {
        execSync('timeout /t 1 /nobreak', { stdio: 'ignore' });
    } catch (e) { }
}

// 2. Remove Directory
if (fs.existsSync(distDir)) {
    console.log('  🗑️  Removing dist-electron folder...');
    let retries = 3;

    while (retries > 0) {
        try {
            fs.rmSync(distDir, { recursive: true, force: true });
            console.log('  ✅ Deleted dist-electron');
            break;
        } catch (e) {
            retries--;
            console.error(`  ⚠️  Failed to delete folder (Lock issue?): ${e.message}`);
            if (retries > 0) {
                console.log('     Retrying in 1 second...');
                try { execSync('timeout /t 1 /nobreak', { stdio: 'ignore' }); } catch (x) { }
            } else {
                console.error('  ❌ Could not delete folder. Please restart your computer.');
                process.exit(1);
            }
        }
    }
} else {
    console.log('  ✅ Clean (folder did not exist)');
}
