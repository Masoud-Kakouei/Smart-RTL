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
                createBackup(bundleFile);

                const backupPath = bundleFile + '.smart-rtl.backup';
                let baseContent = fs.existsSync(backupPath) ? fs.readFileSync(backupPath, 'utf8') : fs.readFileSync(bundleFile, 'utf8');

                // If baseContent still has old SMART RTL block, clean it
                const engineMarker = baseContent.indexOf('/* SMART RTL ENGINE');
                if (engineMarker !== -1) {
                    const endMarker = baseContent.indexOf('/* END SMART RTL ENGINE */');
                    if (endMarker !== -1) {
                        baseContent = baseContent.substring(endMarker + '/* END SMART RTL ENGINE */'.length).trimStart();
                    }
                }

                const newContent = payload + '\n;\n' + baseContent;
                fs.writeFileSync(bundleFile, newContent, 'utf8');
                patchedExtensions.push(ext.name);
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

    // 2. Workbench-level patching (all detected VS Code installations)
    const paths = Array.isArray(vscodeAppPath) ? vscodeAppPath : (vscodeAppPath ? [vscodeAppPath] : []);
    let workbenchPatched = false;

    for (const appPath of paths) {
        const workbenchHTMLPath = path.join(appPath, VSCODE_FILES.workbenchHTML);
        const fontDestPath = path.join(appPath, VSCODE_FILES.font);
        const payloadDestPath = path.join(appPath, VSCODE_FILES.payload);

        if (fs.existsSync(workbenchHTMLPath)) {
            try {
                fs.accessSync(path.dirname(workbenchHTMLPath), fs.constants.W_OK);

                if (fontSourcePath && fs.existsSync(fontSourcePath)) {
                    fs.copyFileSync(fontSourcePath, fontDestPath);
                    const workbenchDir = path.dirname(workbenchHTMLPath);
                    fs.copyFileSync(fontSourcePath, path.join(workbenchDir, 'Vazirmatn-Variable.woff2'));
                }

                if (payloadSourcePath && fs.existsSync(payloadSourcePath)) {
                    fs.copyFileSync(payloadSourcePath, payloadDestPath);
                    const workbenchDir = path.dirname(workbenchHTMLPath);
                    fs.copyFileSync(payloadSourcePath, path.join(workbenchDir, 'smart-rtl.payload.js'));
                }

                const relPayloadPath = '../../../../smart-rtl.payload.js';
                patchHTMLFile(workbenchHTMLPath, relPayloadPath);

                updateProductChecksums(appPath, [
                    VSCODE_FILES.workbenchHTML
                ]);
                workbenchPatched = true;
            } catch (e) {
                // Read-only or system path
            }
        }
    }

    return {
        extensions: patchedExts,
        workbench: workbenchPatched
    };
}

export function restoreVSCode(vscodeAppPath) {
    const restoredExts = restoreExtensionWebviews();
    const paths = Array.isArray(vscodeAppPath) ? vscodeAppPath : (vscodeAppPath ? [vscodeAppPath] : []);

    for (const appPath of paths) {
        const workbenchHTMLPath = path.join(appPath, VSCODE_FILES.workbenchHTML);
        if (fs.existsSync(workbenchHTMLPath)) {
            try {
                restoreHTMLFile(workbenchHTMLPath);

                const fontDestPath = path.join(appPath, VSCODE_FILES.font);
                const payloadDestPath = path.join(appPath, VSCODE_FILES.payload);
                if (fs.existsSync(fontDestPath)) fs.unlinkSync(fontDestPath);
                if (fs.existsSync(payloadDestPath)) fs.unlinkSync(payloadDestPath);

                const workbenchDir = path.dirname(workbenchHTMLPath);
                const extraPayload = path.join(workbenchDir, 'smart-rtl.payload.js');
                const extraFont = path.join(workbenchDir, 'Vazirmatn-Variable.woff2');
                if (fs.existsSync(extraPayload)) fs.unlinkSync(extraPayload);
                if (fs.existsSync(extraFont)) fs.unlinkSync(extraFont);

                const productJSONPath = path.join(appPath, 'product.json');
                restoreBackup(productJSONPath);
            } catch (e) { }
        }
    }

    return restoredExts;
}
