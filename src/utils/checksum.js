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

        let changed = false;
        for (const relPath of updatedRelativePaths) {
            const normalizedKey = relPath.replace(/\\/g, '/');
            const absPath = path.join(appRoot, relPath);
            if (fs.existsSync(absPath)) {
                productData.checksums[normalizedKey] = computeFileChecksum(absPath);
                changed = true;
            }
        }

        if (changed) {
            fs.writeFileSync(productPath, JSON.stringify(productData, null, '\t'), 'utf8');
        }
        return true;
    } catch (e) {
        console.warn('[Smart RTL] Failed to update product.json checksums:', e.message);
        return false;
    }
}
