/**
 * Smart RTL - Configuration Manager
 * Handles persistent settings with backwards-compatible migration support.
 */

export const CONFIG_KEY = 'smart-rtl-config';
export const LEGACY_CONFIG_KEY = 'antigravity-rtl-ide-config';

export const DEFAULT_CONFIG = {
    isRTL: true,
    forceRTL: false,
    fixAtSign: true,
    faFont: '',
    enFont: '',
    codeFont: '',
    lh: '1.6',
    fs: '16'
};

export function loadConfig() {
    let config = { ...DEFAULT_CONFIG };

    try {
        if (typeof localStorage !== 'undefined') {
            let saved = localStorage.getItem(CONFIG_KEY);
            // Fallback & migration from legacy key if new key doesn't exist
            if (!saved) {
                saved = localStorage.getItem(LEGACY_CONFIG_KEY);
            }
            if (saved) {
                const parsed = JSON.parse(saved);
                config = { ...config, ...parsed };
            }
        }
    } catch (e) {
        console.warn('[Smart RTL] Failed to load config from localStorage:', e);
    }

    return config;
}

export function saveConfig(config) {
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
        }
    } catch (e) {
        console.warn('[Smart RTL] Failed to save config to localStorage:', e);
    }
}
