/**
 * Smart RTL - Path Resolver
 * Detects installation directories for Antigravity IDE, VS Code,
 * Antigravity Chat, and installed AI extensions across Windows, macOS, and Linux.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

export function getAntigravityIDEPath() {
    if (os.platform() === 'win32') {
        const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
        return path.join(localAppData, 'Programs', 'Antigravity IDE', 'resources', 'app');
    }
    if (os.platform() === 'darwin') {
        return '/Applications/Antigravity IDE.app/Contents/Resources/app';
    }
    return path.join(os.homedir(), '.local', 'share', 'Antigravity IDE', 'resources', 'app');
}

export function getAntigravityChatPath() {
    if (os.platform() === 'win32') {
        const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
        return path.join(localAppData, 'Programs', 'Antigravity', 'resources', 'app.asar');
    }
    if (os.platform() === 'darwin') {
        return '/Applications/Antigravity.app/Contents/Resources/app.asar';
    }
    return path.join(os.homedir(), '.local', 'share', 'Antigravity', 'resources', 'app.asar');
}

export function getVSCodePath() {
    if (os.platform() === 'win32') {
        const candidateRoots = [
            process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Programs', 'Microsoft VS Code') : null,
            process.env.ProgramFiles ? path.join(process.env.ProgramFiles, 'Microsoft VS Code') : 'C:\\Program Files\\Microsoft VS Code',
            process.env['ProgramFiles(x86)'] ? path.join(process.env['ProgramFiles(x86)'], 'Microsoft VS Code') : null
        ].filter(Boolean);

        for (const root of candidateRoots) {
            if (!fs.existsSync(root)) continue;
            const direct = path.join(root, 'resources', 'app');
            if (fs.existsSync(direct)) return direct;

            try {
                const entries = fs.readdirSync(root, { withFileTypes: true });
                for (const entry of entries) {
                    if (entry.isDirectory() && entry.name !== 'bin') {
                        const subApp = path.join(root, entry.name, 'resources', 'app');
                        if (fs.existsSync(subApp) && fs.existsSync(path.join(subApp, 'out'))) {
                            return subApp;
                        }
                    }
                }
            } catch (e) { }
        }

        const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
        return path.join(localAppData, 'Programs', 'Microsoft VS Code', 'resources', 'app');
    }
    if (os.platform() === 'darwin') {
        return '/Applications/Visual Studio Code.app/Contents/Resources/app';
    }
    const linuxDefault = '/usr/share/code/resources/app';
    if (fs.existsSync(linuxDefault)) return linuxDefault;
    return path.join(os.homedir(), '.local', 'share', 'code', 'resources', 'app');
}


export function getVSCodeExtensionsDir() {
    return path.join(os.homedir(), '.vscode', 'extensions');
}

export function detectInstalledExtensions() {
    const extDir = getVSCodeExtensionsDir();
    const installed = [];

    if (!fs.existsSync(extDir)) return installed;

    const patterns = {
        'cline': { prefix: 'saoudrizwan.claude-dev-', name: 'Cline (Claude Dev)' },
        'continue': { prefix: 'continue.continue-', name: 'Continue' },
        'roocode': { prefix: 'rooveterinaryinc.roo-cline-', name: 'Roo Code' },
        'antigravity': { prefix: 'google.antigravity-', name: 'Antigravity' }
    };

    try {
        const entries = fs.readdirSync(extDir);
        for (const [key, info] of Object.entries(patterns)) {
            const match = entries.find(name => name.startsWith(info.prefix));
            if (match) {
                installed.push({
                    id: key,
                    name: info.name,
                    dirName: match,
                    path: path.join(extDir, match)
                });
            }
        }
    } catch (e) {
        // Silently skip if cannot read directory
    }

    return installed;
}

export function detectAllTargets() {
    const results = [];

    // 1. Antigravity IDE
    const agIdePath = getAntigravityIDEPath();
    if (fs.existsSync(agIdePath)) {
        results.push({
            id: 'antigravity-ide',
            title: 'Antigravity IDE',
            path: agIdePath,
            type: 'ide'
        });
    }

    // 2. VS Code
    const vscodePath = getVSCodePath();
    const vscodeInstalled = fs.existsSync(vscodePath);
    const extensions = detectInstalledExtensions();

    if (vscodeInstalled) {
        results.push({
            id: 'vscode',
            title: 'Visual Studio Code',
            path: vscodePath,
            type: 'vscode',
            extensions
        });
    }

    // 3. Antigravity Chat
    const chatPath = getAntigravityChatPath();
    if (fs.existsSync(chatPath)) {
        results.push({
            id: 'antigravity-chat',
            title: 'Antigravity Chat App',
            path: chatPath,
            type: 'chat'
        });
    }

    return results;
}
