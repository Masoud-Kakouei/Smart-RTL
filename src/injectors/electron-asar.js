/**
 * Smart RTL - Electron ASAR Injector
 * Extracts, patches, and repacks app.asar for Electron apps.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import * as asar from '@electron/asar';
import { createBackup, restoreBackup } from '../utils/backup.js';

export async function patchAsar(asarPath, payloadCode, fontSourcePath) {
    if (!fs.existsSync(asarPath)) {
        throw new Error(`ASAR file not found: ${asarPath}`);
    }

    createBackup(asarPath);

    const tempExtractDir = path.join(os.tmpdir(), 'smart-rtl-asar-' + Date.now());
    const tempPackedAsar = path.join(os.tmpdir(), 'smart-rtl-packed-' + Date.now() + '.asar');

    try {
        asar.extractAll(asarPath, tempExtractDir);

        const targetFile = path.join(tempExtractDir, 'dist', 'main', 'index.js');
        if (!fs.existsSync(targetFile)) {
            throw new Error(`Could not find main script inside asar: ${targetFile}`);
        }

        let content = fs.readFileSync(targetFile, 'utf8');
        if (content.includes('/* SMART RTL PATCH */')) {
            return { alreadyPatched: true };
        }

        const searchPattern = "void win.loadURL(url);";
        if (!content.includes(searchPattern)) {
            throw new Error(`Target injection pattern not found in ASAR: "${searchPattern}"`);
        }

        content = content.replace(searchPattern, payloadCode);
        fs.writeFileSync(targetFile, content, 'utf8');

        // Copy Font into asar
        if (fontSourcePath && fs.existsSync(fontSourcePath)) {
            const fontDest = path.join(tempExtractDir, 'dist', 'main', path.basename(fontSourcePath));
            fs.copyFileSync(fontSourcePath, fontDest);
        }

        await asar.createPackage(tempExtractDir, tempPackedAsar);
        fs.copyFileSync(tempPackedAsar, asarPath);

        return { success: true };
    } finally {
        if (fs.existsSync(tempExtractDir)) {
            fs.rmSync(tempExtractDir, { recursive: true, force: true });
        }
        if (fs.existsSync(tempPackedAsar)) {
            fs.unlinkSync(tempPackedAsar);
        }
    }
}

export function restoreAsar(asarPath) {
    return restoreBackup(asarPath);
}
