/**
 * Smart RTL - VS Code Extension & Webview Injector
 * Injects Smart RTL into VS Code workbench and manages automatic discovery
 * and patching of extension webviews (Cline, Continue, Roo Code, Antigravity).
 */

import fs from 'fs';
import path from 'path';
import { patchHTMLFile, restoreHTMLFile } from './electron-html.js';
import { updateProductChecksums } from '../utils/checksum.js';
import { restoreBackup } from '../utils/backup.js';

export const VSCODE_FILES = {
    workbenchHTML: path.join('out', 'vs', 'code', 'electron-browser', 'workbench', 'workbench.html'),
    font: path.join('out', 'Vazirmatn-Variable.woff2'),
    payload: path.join('out', 'smart-rtl.payload.js')
};

export function patchVSCode(vscodeAppPath, payloadSourcePath, fontSourcePath) {
    const workbenchHTMLPath = path.join(vscodeAppPath, VSCODE_FILES.workbenchHTML);
    const fontDestPath = path.join(vscodeAppPath, VSCODE_FILES.font);
    const payloadDestPath = path.join(vscodeAppPath, VSCODE_FILES.payload);

    if (!fs.existsSync(workbenchHTMLPath)) {
        throw new Error(`VS Code workbench.html not found at: ${workbenchHTMLPath}`);
    }

    // 1. Copy font
    if (fontSourcePath && fs.existsSync(fontSourcePath)) {
        fs.copyFileSync(fontSourcePath, fontDestPath);
        // Also copy into workbench directory
        const workbenchDir = path.dirname(workbenchHTMLPath);
        fs.copyFileSync(fontSourcePath, path.join(workbenchDir, 'Vazirmatn-Variable.woff2'));
    }

    // 2. Copy payload
    if (payloadSourcePath && fs.existsSync(payloadSourcePath)) {
        fs.copyFileSync(payloadSourcePath, payloadDestPath);
        const workbenchDir = path.dirname(workbenchHTMLPath);
        fs.copyFileSync(payloadSourcePath, path.join(workbenchDir, 'smart-rtl.payload.js'));
    }

    // 3. Patch workbench.html
    const relPayloadPath = '../../../../smart-rtl.payload.js';
    patchHTMLFile(workbenchHTMLPath, relPayloadPath);

    // 4. Update checksums in product.json
    updateProductChecksums(vscodeAppPath, [
        VSCODE_FILES.workbenchHTML
    ]);

    return true;
}

export function restoreVSCode(vscodeAppPath) {
    const workbenchHTMLPath = path.join(vscodeAppPath, VSCODE_FILES.workbenchHTML);
    const fontDestPath = path.join(vscodeAppPath, VSCODE_FILES.font);
    const payloadDestPath = path.join(vscodeAppPath, VSCODE_FILES.payload);

    restoreHTMLFile(workbenchHTMLPath);

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

    return true;
}
