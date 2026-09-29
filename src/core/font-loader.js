/**
 * Smart RTL - Font Loader
 * Directly loads Vazirmatn variable font using FontFace API
 * with cross-document and iframe support.
 */

export function loadFontFaceDirectly(targetDoc, fontBase64) {
    const doc = targetDoc || (typeof document !== 'undefined' ? document : null);
    if (!doc || typeof FontFace === 'undefined' || !doc.fonts || !fontBase64) {
        return;
    }

    try {
        let hasVazir = false;
        doc.fonts.forEach(f => {
            if (f.family === 'Vazirmatn' || f.family === 'PersianOnlyFont') {
                hasVazir = true;
            }
        });
        if (hasVazir) return;

        const binStr = atob(fontBase64);
        const len = binStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binStr.charCodeAt(i);
        }

        const ur = 'U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF, U+200C-200F';
        const f1 = new FontFace('Vazirmatn', bytes.buffer, { weight: '100 900', unicodeRange: ur });
        const f2 = new FontFace('PersianOnlyFont', bytes.buffer, { weight: '100 900', unicodeRange: ur });

        f1.load().then(f => doc.fonts.add(f)).catch(() => {});
        f2.load().then(f => doc.fonts.add(f)).catch(() => {});
    } catch (e) {
        // Silently catch in restricted contexts
    }
}
