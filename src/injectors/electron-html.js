/**
 * Smart RTL - Electron HTML Injector
 * Safely patches workbench.html and related HTML files with CSP adjustments,
 * script tag injection, and backup creation.
 */

import fs from 'fs';
import path from 'path';
import { createBackup, restoreBackup } from '../utils/backup.js';

export const PATCH_MARKER = '<!-- SMART RTL PATCH -->';

export function patchHTMLFile(filePath, payloadRelativePath) {
    if (!fs.existsSync(filePath)) return false;

    // Backup original
    createBackup(filePath);

    let html = fs.readFileSync(filePath, 'utf8');

    // Remove previous patch if exists
    if (html.includes(PATCH_MARKER)) {
        const regex = new RegExp(`\\n?${PATCH_MARKER}[\\s\\S]*?<\\/script>\\n?`, 'g');
        html = html.replace(regex, '');
    }
    // Also remove legacy antigravity patch marker if present
    if (html.includes('<!-- ANTIGRAVITY RTL PATCH -->')) {
        const legacyRegex = new RegExp(`\\n?<!-- ANTIGRAVITY RTL PATCH -->[\\s\\S]*?<\\/script>\\n?`, 'g');
        html = html.replace(legacyRegex, '');
    }

    // 1. Remove Trusted Types script requirement from CSP so DOM creation works smoothly
    html = html.replace(/require-trusted-types-for\s*[\n\r\t]*'script'\s*;?/g, '');

    // 2. Allow default and rtlPolicy in trusted-types directive
    if (html.includes('trusted-types') && !html.includes('rtlPolicy')) {
        html = html.replace(/(trusted-types\s*\n?)/, "$1\t\t\t\t\tdefault\n\t\t\t\t\trtlPolicy\n");
    }

    // 3. Add data: to font-src for base64 fonts
    if (html.includes('font-src')) {
        const fontSrcRegex = /(font-src[\s\S]*?)(;)/;
        html = html.replace(fontSrcRegex, (match, p1, p2) => {
            if (!p1.includes('data:')) {
                return p1.replace(/'self'/, "'self'\n\t\t\t\t\tdata:") + p2;
            }
            return match;
        });
    }

    // 4. Inject payload script tag before </html>
    const scriptTag = `\n${PATCH_MARKER}\n<script src="${payloadRelativePath}" defer></script>\n`;
    html = html.replace('</html>', scriptTag + '</html>');

    fs.writeFileSync(filePath, html, 'utf8');
    return true;
}

export function restoreHTMLFile(filePath) {
    return restoreBackup(filePath);
}
