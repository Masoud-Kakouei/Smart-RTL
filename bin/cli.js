#!/usr/bin/env node

/**
 * Smart RTL - Interactive Command Line Patcher
 * Supports Antigravity IDE, VS Code (Cline, Continue, Roo Code, Antigravity),
 * and Electron applications.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import picocolors from 'picocolors';
import ora from 'ora';
import prompts from 'prompts';

import { detectAllTargets, getAntigravityIDEPath, getVSCodePath, getAntigravityChatPath } from '../src/utils/path-resolver.js';
import { patchHTMLFile, restoreHTMLFile } from '../src/injectors/electron-html.js';
import { patchAsar, restoreAsar } from '../src/injectors/electron-asar.js';
import { patchVSCode, restoreVSCode } from '../src/injectors/vscode-extension.js';
import { updateProductChecksums } from '../src/utils/checksum.js';
import { restoreBackup, hasBackup } from '../src/utils/backup.js';

const { green, red, yellow, blue, bold, cyan, magenta, gray } = picocolors;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const fontSourcePath = path.join(rootDir, 'fonts', 'Vazirmatn-Variable.woff2');
const idePayloadPath = path.join(rootDir, 'dist', 'antigravity-ide.payload.js');
const vscodePayloadPath = path.join(rootDir, 'dist', 'vscode.payload.js');
const chatPayloadPath = path.join(rootDir, 'dist', 'antigravity-chat.payload.js');

// Parse arguments
const args = process.argv.slice(2);
const isRestore = args.includes('--restore');
const isStatus = args.includes('--status');
const isHelp = args.includes('--help') || args.includes('-h');

function getArgValue(flag) {
    const idx = args.indexOf(flag);
    if (idx !== -1 && idx + 1 < args.length) {
        return args[idx + 1];
    }
    return null;
}

const targetArg = getArgValue('--target') || (
    args.includes('ide') ? 'antigravity-ide' :
    args.includes('vscode') ? 'vscode' :
    args.includes('chat') ? 'antigravity-chat' :
    args.includes('all') ? 'all' : null
);

function showBanner() {
    console.log(bold(cyan('\n╔════════════════════════════════════════════════════════╗')));
    console.log(bold(cyan('║                      🌐 SMART RTL                      ║')));
    console.log(bold(cyan('║     Persian & Arabic BiDi Engine for VS Code & IDEs    ║')));
    console.log(bold(cyan('╚════════════════════════════════════════════════════════╝\n')));
}

function showHelp() {
    showBanner();
    console.log(`Usage: smart-rtl [options]\n`);
    console.log(`Options:`);
    console.log(`  --target <name>   Patch specific target: antigravity-ide, vscode, antigravity-chat, all`);
    console.log(`  --restore         Restore original unpatched files`);
    console.log(`  --status          Display current patch status for all detected targets`);
    console.log(`  -h, --help        Show this help message\n`);
    console.log(`Examples:`);
    console.log(`  npx smart-rtl`);
    console.log(`  npx smart-rtl --target antigravity-ide`);
    console.log(`  npx smart-rtl --target vscode`);
    console.log(`  npx smart-rtl --restore\n`);
}

function checkPermissions(dirPath) {
    try {
        fs.accessSync(dirPath, fs.constants.W_OK);
        return true;
    } catch (e) {
        return false;
    }
}

// ── Target Patchers ──────────────────────────────────────────────────

async function patchAntigravityIDE(idePath) {
    const spinner = ora('Checking Antigravity IDE...').start();

    if (!fs.existsSync(idePath)) {
        spinner.fail(`Antigravity IDE path not found: ${idePath}`);
        return false;
    }

    const workbenchDir = path.join(idePath, 'out', 'vs', 'code', 'electron-browser', 'workbench');
    const workbenchHTML = path.join(workbenchDir, 'workbench.html');
    const jetskiHTML = path.join(workbenchDir, 'workbench-jetski-agent.html');

    if (!fs.existsSync(workbenchHTML)) {
        spinner.fail(`workbench.html not found at: ${workbenchHTML}`);
        return false;
    }

    if (!checkPermissions(workbenchDir)) {
        spinner.fail('Permission Denied.');
        console.error(red('\nPlease run this terminal as Administrator (or with sudo).\n'));
        return false;
    }

    if (isRestore) {
        spinner.text = 'Restoring Antigravity IDE backup...';
        restoreHTMLFile(workbenchHTML);
        if (fs.existsSync(jetskiHTML)) restoreHTMLFile(jetskiHTML);

        const payloadDest = path.join(idePath, 'out', 'smart-rtl.payload.js');
        const fontDest = path.join(idePath, 'out', 'Vazirmatn-Variable.woff2');
        if (fs.existsSync(payloadDest)) fs.unlinkSync(payloadDest);
        if (fs.existsSync(fontDest)) fs.unlinkSync(fontDest);

        const extraPayload = path.join(workbenchDir, 'smart-rtl.payload.js');
        const extraFont = path.join(workbenchDir, 'Vazirmatn-Variable.woff2');
        if (fs.existsSync(extraPayload)) fs.unlinkSync(extraPayload);
        if (fs.existsSync(extraFont)) fs.unlinkSync(extraFont);

        restoreBackup(path.join(idePath, 'product.json'));

        spinner.succeed('Successfully restored original Antigravity IDE!');
        console.log(green('✨ Please restart Antigravity IDE to apply changes.\n'));
        return true;
    }

    spinner.text = 'Deploying font and payload...';
    // Copy font
    const fontOut = path.join(idePath, 'out', 'Vazirmatn-Variable.woff2');
    fs.copyFileSync(fontSourcePath, fontOut);
    fs.copyFileSync(fontSourcePath, path.join(workbenchDir, 'Vazirmatn-Variable.woff2'));

    // Copy payload
    const payloadOut = path.join(idePath, 'out', 'smart-rtl.payload.js');
    fs.copyFileSync(idePayloadPath, payloadOut);
    fs.copyFileSync(idePayloadPath, path.join(workbenchDir, 'smart-rtl.payload.js'));

    spinner.text = 'Patching workbench HTML files...';
    patchHTMLFile(workbenchHTML, '../../../../smart-rtl.payload.js');
    if (fs.existsSync(jetskiHTML)) {
        patchHTMLFile(jetskiHTML, '../../../../smart-rtl.payload.js');
    }

    spinner.text = 'Updating installation checksums...';
    updateProductChecksums(idePath, [
        path.join('out', 'vs', 'code', 'electron-browser', 'workbench', 'workbench.html'),
        path.join('out', 'vs', 'code', 'electron-browser', 'workbench', 'workbench-jetski-agent.html')
    ]);

    spinner.succeed('Successfully patched Antigravity IDE!');
    console.log(green('\n✨ Smart RTL is now active in Antigravity IDE!'));
    console.log(cyan('  • Chat view & conversation panels'));
    console.log(cyan('  • Implementation Plan, Walkthrough, and Tasks'));
    console.log(cyan('  • Smart Toolbar Toggle (with 3-stage adaptive positioning)'));
    console.log(cyan('  • Auto-recalculated checksums (No corruption warning)'));
    console.log(yellow('🔄 Please restart Antigravity IDE to apply the changes.\n'));
    return true;
}

async function patchVSCodeTarget(vscodePath) {
    const spinner = ora('Checking VS Code & Extensions...').start();

    if (isRestore) {
        spinner.text = 'Restoring VS Code & Extensions backup...';
        try {
            const restored = restoreVSCode(vscodePath);
            spinner.succeed('Successfully restored original VS Code & Extensions!');
            if (restored.length > 0) {
                console.log(cyan('\n  Restored Extensions: ' + restored.join(', ')));
            }
            console.log(green('✨ Please restart VS Code to apply changes.\n'));
            return true;
        } catch (e) {
            spinner.fail('Failed to restore: ' + e.message);
            return false;
        }
    }

    spinner.text = 'Deploying Smart RTL to VS Code & AI Extensions...';
    try {
        const result = patchVSCode(vscodePath, vscodePayloadPath, fontSourcePath);
        spinner.succeed('Successfully patched VS Code & Extensions!');
        console.log(green('\n✨ Smart RTL is now active in:'));
        if (result.extensions && result.extensions.length > 0) {
            result.extensions.forEach(name => {
                console.log(cyan(`  • ${name}`));
            });
        }
        if (result.workbench) {
            console.log(cyan('  • VS Code Workbench (Tabs, inputs, dialogs)'));
        }
        console.log(yellow('🔄 Please close and reopen the extension tab or restart VS Code.\n'));
        return true;
    } catch (e) {
        spinner.fail('Failed to patch VS Code: ' + e.message);
        return false;
    }
}

async function patchAntigravityChatTarget(chatPath) {
    const spinner = ora('Checking Antigravity Chat application...').start();

    if (!fs.existsSync(chatPath)) {
        spinner.fail(`Antigravity Chat asar not found at: ${chatPath}`);
        return false;
    }

    if (!checkPermissions(path.dirname(chatPath))) {
        spinner.fail('Permission Denied.');
        console.error(red('\nPlease run this terminal as Administrator (or with sudo).\n'));
        return false;
    }

    if (isRestore) {
        spinner.text = 'Restoring Antigravity Chat backup...';
        if (restoreAsar(chatPath)) {
            spinner.succeed('Successfully restored Antigravity Chat!');
            console.log(green('✨ Please restart Antigravity to apply changes.\n'));
            return true;
        } else {
            spinner.fail('No backup found for Antigravity Chat.');
            return false;
        }
    }

    spinner.text = 'Patching Antigravity Chat app.asar...';
    const payloadContent = fs.readFileSync(chatPayloadPath, 'utf8');
    try {
        const result = await patchAsar(chatPath, payloadContent, fontSourcePath);
        if (result.alreadyPatched) {
            spinner.succeed('Antigravity Chat is already patched!');
        } else {
            spinner.succeed('Successfully patched Antigravity Chat!');
        }
        console.log(green('\n✨ Please restart Antigravity to apply changes.\n'));
        return true;
    } catch (e) {
        spinner.fail('Failed to patch Antigravity Chat: ' + e.message);
        return false;
    }
}

// ── Status Report ────────────────────────────────────────────────────

function reportStatus() {
    showBanner();
    console.log(bold('📊 Smart RTL Target Status:\n'));

    const targets = detectAllTargets();
    if (targets.length === 0) {
        console.log(yellow('  No supported installations detected.\n'));
        return;
    }

    targets.forEach(t => {
        console.log(bold(magenta(`  ● ${t.title}`)));
        console.log(`    Path: ${gray(t.path)}`);

        if (t.type === 'ide' || t.type === 'vscode') {
            const htmlPath = path.join(t.path, 'out', 'vs', 'code', 'electron-browser', 'workbench', 'workbench.html');
            const isPatched = fs.existsSync(htmlPath) && fs.readFileSync(htmlPath, 'utf8').includes('smart-rtl.payload.js');
            const hasBak = hasBackup(htmlPath);
            console.log(`    Status: ${isPatched ? green('Patched ✓') : yellow('Not Patched ✗')}`);
            console.log(`    Backup: ${hasBak ? green('Available ✓') : gray('None')}`);

            if (t.extensions && t.extensions.length > 0) {
                console.log(`    Detected AI Extensions:`);
                t.extensions.forEach(ext => {
                    console.log(`      ├── ${cyan(ext.name)} ${gray('(' + ext.dirName + ')')}`);
                });
            }
        } else if (t.type === 'chat') {
            const hasBak = hasBackup(t.path);
            console.log(`    Status: ${hasBak ? green('Patched (Backup exists) ✓') : yellow('Not Patched ✗')}`);
        }
        console.log('');
    });
}

// ── Main Controller ──────────────────────────────────────────────────

async function main() {
    if (isHelp) {
        showHelp();
        return;
    }

    if (isStatus) {
        reportStatus();
        return;
    }

    showBanner();

    let target = targetArg;
    let targetPath = null;

    if (!target) {
        const detected = detectAllTargets();
        const choices = [];

        detected.forEach(d => {
            let desc = '';
            if (d.extensions && d.extensions.length > 0) {
                desc = ` (${d.extensions.map(e => e.name).join(', ')})`;
            }
            choices.push({
                title: `${d.title}${desc}`,
                value: d.id,
                path: d.path
            });
        });

        if (choices.length > 1) {
            choices.push({
                title: '⚡ All Detected Applications',
                value: 'all'
            });
        }

        choices.push({
            title: '📁 Enter Custom Path...',
            value: 'custom'
        });

        const response = await prompts({
            type: 'select',
            name: 'selectedTarget',
            message: isRestore ? 'Which application do you want to restore?' : 'Which application do you want to patch with Smart RTL?',
            choices
        });

        if (!response.selectedTarget) {
            console.log(yellow('\nOperation cancelled.'));
            process.exit(0);
        }

        target = response.selectedTarget;

        if (target === 'custom') {
            const pathResp = await prompts({
                type: 'text',
                name: 'customPath',
                message: 'Enter full path to installation (e.g. resources/app):'
            });
            if (!pathResp.customPath || !fs.existsSync(pathResp.customPath)) {
                console.error(red('\nInvalid path specified. Aborting.\n'));
                process.exit(1);
            }
            targetPath = pathResp.customPath;
            target = targetPath.endsWith('.asar') ? 'antigravity-chat' : 'antigravity-ide';
        }
    }

    // Execute Target(s)
    if (target === 'antigravity-ide') {
        const p = targetPath || getAntigravityIDEPath();
        await patchAntigravityIDE(p);
    } else if (target === 'vscode') {
        const p = targetPath || getVSCodePath();
        await patchVSCodeTarget(p);
    } else if (target === 'antigravity-chat') {
        const p = targetPath || getAntigravityChatPath();
        await patchAntigravityChatTarget(p);
    } else if (target === 'all') {
        const agIde = getAntigravityIDEPath();
        if (fs.existsSync(agIde)) {
            console.log(bold('\n── 1. Patching Antigravity IDE ──\n'));
            await patchAntigravityIDE(agIde);
        }

        const vscode = getVSCodePath();
        if (fs.existsSync(vscode)) {
            console.log(bold('\n── 2. Patching Visual Studio Code ──\n'));
            await patchVSCodeTarget(vscode);
        }

        const chat = getAntigravityChatPath();
        if (fs.existsSync(chat)) {
            console.log(bold('\n── 3. Patching Antigravity Chat App ──\n'));
            await patchAntigravityChatTarget(chat);
        }
    }
}

main().catch(err => {
    console.error(red('\n✖ Error:'), err.message || err);
    process.exit(1);
});
