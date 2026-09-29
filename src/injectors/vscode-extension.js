/**
 * Smart RTL - VS Code Extension & Webview Injector
 * Injects Smart RTL into VS Code workbench and directly into AI extension webviews
 * (Cline, Continue, Roo Code, Antigravity) inside user directory.
 */

import fs from 'fs';
import path from 'path';
import { patchHTMLFile, restoreHTMLFile } from './electron-html.js';
import { updateProductChecksums } from '../utils/checksum.js';
import { restoreBackup, createBackup } from '../utils/backup.js';
import { detectInstalledExtensions } from '../utils/path-resolver.js';

export const VSCODE_FILES = {
    workbenchHTML: path.join('out', 'vs', 'code', 'electron-browser', 'workbench', 'workbench.html'),
    font: path.join('out', 'Vazirmatn-Variable.woff2'),
    payload: path.join('out', 'smart-rtl.payload.js')
};

export const EXTENSION_BUNDLES = {
    'continue': [
        path.join('gui', 'assets', 'index.js')
    ],
    'cline': [
        path.join('webview-ui', 'build', 'assets', 'index.js')
    ],
    'roocode': [
        path.join('webview-ui', 'build', 'assets', 'index.js')
    ]
};

export function patchExtensionWebviews(payloadSourcePath) {
    const installed = detectInstalledExtensions();
    const payload = fs.readFileSync(payloadSourcePath, 'utf8');
    const patchedExtensions = [];

    for (const ext of installed) {
        const relativeBundlePaths = EXTENSION_BUNDLES[ext.id];
        if (!relativeBundlePaths) continue;

        for (const rel of relativeBundlePaths) {
            const bundleFile = path.join(ext.path, rel);
            if (fs.existsSync(bundleFile)) {
                // Create backup
                createBackup(bundleFile);

                let content = fs.readFileSync(bundleFile, 'utf8');
                if (!content.includes('SMART RTL ENGINE')) {
                    content = payload + '\n;\n' + content;
                    fs.writeFileSync(bundleFile, content, 'utf8');
                    patchedExtensions.push(ext.name);
                } else {
                    patchedExtensions.push(ext.name + ' (already patched)');
                }
            }
        }
    }

    return patchedExtensions;
}

export function restoreExtensionWebviews() {
    const installed = detectInstalledExtensions();
    const restored = [];

    for (const ext of installed) {
        const relativeBundlePaths = EXTENSION_BUNDLES[ext.id];
        if (!relativeBundlePaths) continue;

        for (const rel of relativeBundlePaths) {
            const bundleFile = path.join(ext.path, rel);
            if (restoreBackup(bundleFile)) {
                restored.push(ext.name);
            }
        }
    }

    return restored;
}

export function patchVSCode(vscodeAppPath, payloadSourcePath, fontSourcePath) {
    // 1. Direct Webview Injection into Extensions (Works without Admin permissions!)
    const patchedExts = patchExtensionWebviews(payloadSourcePath);

    // 2. Workbench-level patching (if available and writable)
    let workbenchPatched = false;
    if (vscodeAppPath) {
        const workbenchHTMLPath = path.join(vscodeAppPath, VSCODE_FILES.workbenchHTML);
        const fontDestPath = path.join(vscodeAppPath, VSCODE_FILES.font);
        const payloadDestPath = path.join(vscodeAppPath, VSCODE_FILES.payload);

        if (fs.existsSync(workbenchHTMLPath)) {
            try {
                // Check write access
                fs.accessSync(path.dirname(workbenchHTMLPath), fs.constants.W_OK);

                // Copy font
                if (fontSourcePath && fs.existsSync(fontSourcePath)) {
                    fs.copyFileSync(fontSourcePath, fontDestPath);
                    const workbenchDir = path.dirname(workbenchHTMLPath);
                    fs.copyFileSync(fontSourcePath, path.join(workbenchDir, 'Vazirmatn-Variable.woff2'));
                }

                // Copy payload
                if (payloadSourcePath && fs.existsSync(payloadSourcePath)) {
                    fs.copyFileSync(payloadSourcePath, payloadDestPath);
                    const workbenchDir = path.dirname(workbenchHTMLPath);
                    fs.copyFileSync(payloadSourcePath, path.join(workbenchDir, 'smart-rtl.payload.js'));
                }

                // Patch workbench.html
                const relPayloadPath = '../../../../smart-rtl.payload.js';
                patchHTMLFile(workbenchHTMLPath, relPayloadPath);

                // Update checksums in product.json
                updateProductChecksums(vscodeAppPath, [
                    VSCODE_FILES.workbenchHTML
                ]);
                workbenchPatched = true;
            } catch (e) {
                // Read-only or system path; extensions are already patched directly
            }
        }
    }

    return {
        extensions: patchedExts,
        workbench: workbenchPatched
    };
}

export function restoreVSCode(vscodeAppPath) {
    // Restore extensions
    const restoredExts = restoreExtensionWebviews();

    // Restore workbench if it was patched
    if (vscodeAppPath) {
        const workbenchHTMLPath = path.join(vscodeAppPath, VSCODE_FILES.workbenchHTML);
        if (fs.existsSync(workbenchHTMLPath)) {
            try {
                restoreHTMLFile(workbenchHTMLPath);

                const fontDestPath = path.join(vscodeAppPath, VSCODE_FILES.font);
                const payloadDestPath = path.join(vscodeAppPath, VSCODE_FILES.payload);
                if (fs.existsSync(fontDestPath)) fs.unlinkSync(fontDestPath);
                if (fs.existsSync(payloadDestPath)) fs.unlinkSync(payloadDestPath);

                const workbenchDir = path.dirname(workbenchHTMLPath);
                const extraPayload = path.join(workbenchDir, 'smart-rtl.payload.js');
                const extraFont = path.join(workbenchDir, 'Vazirmatn-Variable.woff2');
                if (fs.existsSync(extraPayload)) fs.unlinkSync(extraPayload);
                if (fs.existsSync(extraFont)) fs.unlinkSync(extraFont);

                // Restore product.json
                const productJSONPath = path.join(vscodeAppPath, 'product.json');
                restoreBackup(productJSONPath);
            } catch (e) { }
        }
    }

    return restoredExts;
}
