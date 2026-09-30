/**
 * Smart RTL - Checksum Manager
 * Calculates SHA-256 base64 checksums and manages product.json
 * to prevent "installation appears to be corrupt" warnings.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export function computeFileChecksum(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('base64').replace(/=+$/, '');
}

export function updateProductChecksums(appRoot, updatedRelativePaths) {
    const productPath = path.join(appRoot, 'product.json');
    if (!fs.existsSync(productPath)) return false;

    try {
        const productData = JSON.parse(fs.readFileSync(productPath, 'utf8'));
        if (!productData.checksums) return false;

        // Clean up any stray keys starting with "out/" (which break VS Code's internal FileAccess.asFileUri)
        for (const key of Object.keys(productData.checksums)) {
            if (key.startsWith('out/')) {
                delete productData.checksums[key];
            }
        }

        for (const relPath of updatedRelativePaths) {
            let normalizedKey = relPath.replace(/\\/g, '/');
            if (normalizedKey.startsWith('out/')) {
                normalizedKey = normalizedKey.substring(4);
            }
            if (normalizedKey.startsWith('/')) {
                normalizedKey = normalizedKey.substring(1);
            }

            const absPath = path.join(appRoot, 'out', normalizedKey);
            if (fs.existsSync(absPath)) {
                const sum = computeFileChecksum(absPath);
                productData.checksums[normalizedKey] = sum;
            }
        }

        fs.writeFileSync(productPath, JSON.stringify(productData, null, '\t'), 'utf8');
        return true;
    } catch (e) {
        console.warn('[Smart RTL] Failed to update product.json checksums:', e.message);
        return false;
    }
}
