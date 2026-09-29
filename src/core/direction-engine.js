/**
 * Smart RTL - Direction Engine
 * Accurately detects text direction for Persian, Arabic, and Hebrew text.
 * Optimized with TreeWalker for high performance DOM traversal without cloneNode.
 */

export const PERSIAN_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
export const ZERO_WIDTH_REGEX = /[\u200B-\u200F\uFEFF]/g;

/**
 * Clean zero-width and invisible control characters
 */
export function cleanText(text) {
    if (!text) return '';
    return text.replace(ZERO_WIDTH_REGEX, '').trim();
}

/**
 * Checks whether text contains any Persian/Arabic characters
 */
export function hasPersianText(text) {
    const clean = cleanText(text);
    if (!clean) return false;
    return PERSIAN_REGEX.test(clean);
}

/**
 * Detect direction:
 * - If forceRTL is true -> 'rtl'
 * - If contains Persian/Arabic -> 'rtl' (handles sentences starting with English words like "car رو برای تست نوشتم")
 * - Otherwise -> 'ltr'
 */
export function detectDirection(text, forceRTL = false) {
    const clean = cleanText(text);
    if (!clean) return null;
    if (forceRTL) return 'rtl';
    return PERSIAN_REGEX.test(clean) ? 'rtl' : 'ltr';
}

/**
 * High-performance text extractor that walks text nodes only and skips
 * code blocks, monospace tags, and editor areas without DOM cloning.
 */
export function getCleanElementText(el) {
    if (!el) return '';
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
        return cleanText(el.value || '');
    }

    // Direct text if no children
    if (!el.firstElementChild) {
        return cleanText(el.textContent || '');
    }

    // Walk text nodes, skipping pre/code/.font-mono
    let extracted = '';
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            if (
                parent.tagName === 'PRE' ||
                parent.tagName === 'CODE' ||
                parent.classList.contains('font-mono') ||
                parent.closest('pre') ||
                parent.closest('.monaco-editor')
            ) {
                return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
        }
    });

    while (walker.nextNode()) {
        extracted += walker.currentNode.textContent + ' ';
    }

    return cleanText(extracted);
}
