/**
 * Smart RTL - Backup and Restore Utilities
 */

import fs from 'fs';

export function createBackup(filePath) {
    if (!fs.existsSync(filePath)) return false;
    const backupPath = filePath + '.bak';
    if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(filePath, backupPath);
        return true;
    }
    return false;
}

export function restoreBackup(filePath) {
    const backupPath = filePath + '.bak';
    if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, filePath);
        fs.unlinkSync(backupPath);
        return true;
    }
    return false;
}

export function hasBackup(filePath) {
    return fs.existsSync(filePath + '.bak');
}
