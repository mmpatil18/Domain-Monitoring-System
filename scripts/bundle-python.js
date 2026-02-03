/**
 * Python Bundling Script for Electron Builder
 * 
 * This script creates a standalone Python distribution that can be bundled with the Electron app.
 * It handles platform-specific bundling for Windows, macOS, and Linux.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const platform = process.platform;
const outputDir = path.join(__dirname, '..', 'python-dist');

console.log(`\n🐍 Bundling Python for ${platform}...\n`);

// Create output directory
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Function to install requirements
function installRequirements() {
    console.log('📦 Installing dependencies from requirements.txt...');
    try {
        if (platform === 'win32') {
            execSync('python -m pip install -r requirements.txt', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
            console.log('📋 Installed Packages:');
            execSync('python -m pip list', { stdio: 'inherit' });
        } else {
            execSync('pip3 install -r requirements.txt', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
            console.log('📋 Installed Packages:');
            execSync('pip3 list', { stdio: 'inherit' });
        }
        console.log('✅ Dependencies installed successfully!');
    } catch (error) {
        console.error('❌ Failed to install dependencies:', error.message);
        process.exit(1);
    }
}

// Install requirements before anything else
installRequirements();

// Function to copy frontend assets to the bundled directory
function copyFrontend(targetDir) {
    const frontendSrc = path.join(__dirname, '..', 'frontend');
    const frontendDest = path.join(outputDir, targetDir, 'frontend');

    console.log(`📂 Copying frontend from ${frontendSrc} to ${frontendDest}...`);

    if (fs.existsSync(frontendDest)) {
        fs.rmSync(frontendDest, { recursive: true, force: true });
    }

    copyRecursive(frontendSrc, frontendDest);

    // Copy .env.example
    const envSrc = path.join(__dirname, '..', '.env.example');
    const envDest = path.join(outputDir, targetDir, '.env');
    if (fs.existsSync(envSrc)) {
        fs.copyFileSync(envSrc, envDest);
    }

    console.log('✅ Frontend assets copied successfully!');
}

/**
 * Bundle Python for Windows
 */
function bundleWindows() {
    console.log('📦 Creating Windows Python bundle...');

    try {
        // Install PyInstaller if not already installed
        console.log('Installing PyInstaller...');
        execSync('python -m pip install pyinstaller', { stdio: 'inherit' });

        // Common hidden imports
        const hiddenImports = ' --hidden-import=flask --hidden-import=dns --hidden-import=whois --hidden-import=requests --hidden-import=dotenv';

        // Bundle the API
        console.log('Bundling Python API...');
        execSync(`python -m PyInstaller --noconfirm --onedir --clean --distpath "${outputDir}" --workpath build --specpath build --name domain-monitor-api${hiddenImports} backend/api.py`, {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
        copyFrontend('domain-monitor-api');

        // Bundle the Monitor Service
        console.log('Bundling Monitor Service...');
        execSync(`python -m PyInstaller --noconfirm --onedir --clean --distpath "${outputDir}" --workpath build --specpath build --name domain-monitor-service${hiddenImports} backend/monitor_service.py`, {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
        copyFrontend('domain-monitor-service');

        console.log('✅ Windows Python bundle created successfully!');

    } catch (error) {
        console.error('❌ Failed to bundle Python for Windows:', error.message);
        console.log('\n⚠️  Falling back to copying backend files...');
        fallbackCopy();
    }
}

/**
 * Bundle Python for macOS
 */
function bundleMacOS() {
    console.log('📦 Creating macOS Python bundle...');

    try {
        // For macOS, we'll use PyInstaller as well
        console.log('Installing PyInstaller...');
        execSync('pip3 install pyinstaller', { stdio: 'inherit' });

        // Common hidden imports
        const hiddenImports = ' --hidden-import=flask --hidden-import=dns --hidden-import=whois --hidden-import=requests --hidden-import=dotenv';

        console.log('Bundling Python API...');
        execSync(`python3 -m PyInstaller --noconfirm --onedir --clean --distpath "${outputDir}" --workpath build --specpath build --name domain-monitor-api${hiddenImports} backend/api.py`, {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
        copyFrontend('domain-monitor-api');

        console.log('Bundling Monitor Service...');
        execSync(`python3 -m PyInstaller --noconfirm --onedir --clean --distpath "${outputDir}" --workpath build --specpath build --name domain-monitor-service${hiddenImports} backend/monitor_service.py`, {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
        copyFrontend('domain-monitor-service');

        console.log('✅ macOS Python bundle created successfully!');

    } catch (error) {
        console.error('❌ Failed to bundle Python for macOS:', error.message);
        console.log('\n⚠️  Falling back to copying backend files...');
        fallbackCopy();
    }
}

/**
 * Bundle Python for Linux
 */
function bundleLinux() {
    console.log('📦 Creating Linux Python bundle...');

    try {
        // For Linux, we'll use PyInstaller
        console.log('Installing PyInstaller...');
        execSync('pip3 install pyinstaller', { stdio: 'inherit' });

        // Common hidden imports
        const hiddenImports = ' --hidden-import=flask --hidden-import=dns --hidden-import=whois --hidden-import=requests --hidden-import=dotenv';

        console.log('Bundling Python API...');
        execSync(`python3 -m PyInstaller --noconfirm --onedir --clean --distpath "${outputDir}" --workpath build --specpath build --name domain-monitor-api${hiddenImports} backend/api.py`, {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
        copyFrontend('domain-monitor-api');

        console.log('Bundling Monitor Service...');
        execSync(`python3 -m PyInstaller --noconfirm --onedir --clean --distpath "${outputDir}" --workpath build --specpath build --name domain-monitor-service${hiddenImports} backend/monitor_service.py`, {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
        copyFrontend('domain-monitor-service');

        console.log('✅ Linux Python bundle created successfully!');

    } catch (error) {
        console.error('❌ Failed to bundle Python for Linux:', error.message);
        console.log('\n⚠️  Falling back to copying backend files...');
        fallbackCopy();
    }
}

/**
 * Fallback: Copy Python and backend files directly
 */
function fallbackCopy() {
    console.log('📁 Copying Python backend files...');

    const backendSrc = path.join(__dirname, '..', 'backend');
    const backendDest = path.join(outputDir, 'backend');

    // Copy backend directory
    if (fs.existsSync(backendDest)) {
        fs.rmSync(backendDest, { recursive: true });
    }

    copyRecursive(backendSrc, backendDest);

    // Copy requirements.txt
    const requirementsSrc = path.join(__dirname, '..', 'requirements.txt');
    const requirementsDest = path.join(outputDir, 'requirements.txt');
    fs.copyFileSync(requirementsSrc, requirementsDest);

    console.log('✅ Backend files copied successfully!');
    console.log('⚠️  Note: Users will need Python installed on their system');
}

/**
 * Recursively copy directory
 */
// Run platform-specific bundling
function copyRecursive(src, dest) {
    console.log(`    Copying ${src} -> ${dest}`);
    try {
        if (fs.cpSync) {
            fs.cpSync(src, dest, { recursive: true, force: true });
        } else {
            // Fallback for older Node versions
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true });
            }
            const entries = fs.readdirSync(src, { withFileTypes: true });
            for (const entry of entries) {
                const srcPath = path.join(src, entry.name);
                const destPath = path.join(dest, entry.name);
                if (entry.name === '__pycache__' || entry.name.endsWith('.pyc')) continue;

                if (entry.isDirectory()) {
                    copyRecursive(srcPath, destPath);
                } else {
                    fs.copyFileSync(srcPath, destPath);
                }
            }
        }
        console.log(`    ✅ Copied content to ${dest}`);
    } catch (e) {
        console.error(`    ❌ Copy failed: ${e.message}`);
    }
}

// Run platform-specific bundling
switch (platform) {
    case 'win32':
        bundleWindows();
        break;
    case 'darwin':
        bundleMacOS();
        break;
    case 'linux':
        bundleLinux();
        break;
    default:
        console.error(`❌ Unsupported platform: ${platform}`);
        process.exit(1);
}

console.log('\n✨ Python bundling complete!\n');
