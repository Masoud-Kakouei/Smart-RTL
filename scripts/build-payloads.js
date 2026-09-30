/**
 * Smart RTL - Payload Builder
 * Compiles modular source code into standalone, self-contained browser payloads.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const fontPath = path.join(rootDir, "fonts", "Vazirmatn-Variable.woff2");
if (!fs.existsSync(fontPath)) {
  console.error(`Font not found at: ${fontPath}`);
  process.exit(1);
}

const fontBase64 = fs.readFileSync(fontPath).toString("base64");

function buildClientPayload(options = {}) {
  const { targetName = "universal" } = options;

  return `/* SMART RTL ENGINE - TARGET: ${targetName.toUpperCase()} */
(function () {
    'use strict';

    if (window.__SMART_RTL_LOADED__) return;
    window.__SMART_RTL_LOADED__ = true;

    // ── Constants & Regex ────────────────────────────────────
    const CONFIG_KEY = 'smart-rtl-config';
    const LEGACY_CONFIG_KEY = 'antigravity-rtl-ide-config';
    const FONT_BASE64 = '${fontBase64}';

    const PERSIAN_REGEX = /[\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF]/;
    const ZERO_WIDTH_REGEX = /[\\u200B-\\u200F\\uFEFF]/g;

    // ── Configuration State ──────────────────────────────────
    let config = {
        isRTL: true,
        forceRTL: false,
        fixAtSign: true,
        faFont: '',
        enFont: '',
        codeFont: '',
        lh: '1.6',
        fs: '16'
    };

    try {
        let saved = localStorage.getItem(CONFIG_KEY) || localStorage.getItem(LEGACY_CONFIG_KEY);
        if (saved) {
            config = { ...config, ...JSON.parse(saved) };
        }
    } catch (e) { }

    function saveConfig() {
        try {
            localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
        } catch (e) { }
    }

    // ── Direction Detection Engine ───────────────────────────
    function cleanText(text) {
        if (!text) return '';
        return text.replace(ZERO_WIDTH_REGEX, '').trim();
    }

    function hasPersianText(text) {
        const clean = cleanText(text);
        if (!clean) return false;
        return PERSIAN_REGEX.test(clean);
    }

    function detectDirection(text, forceRTL = false) {
        const clean = cleanText(text);
        if (!clean) return null;
        if (forceRTL) return 'rtl';
        return PERSIAN_REGEX.test(clean) ? 'rtl' : 'ltr';
    }

    function getCleanElementText(el) {
        if (!el) return '';
        if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
            return cleanText(el.value || '');
        }
        if (!el.firstElementChild) {
            return cleanText(el.textContent || '');
        }

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

    // ── Trusted Types Safe DOM Creation ──────────────────────
    function safeCreateElement(htmlString) {
        if (window.trustedTypes && window.trustedTypes.createPolicy) {
            try {
                if (!window.__rtlPolicy) {
                    window.__rtlPolicy = window.trustedTypes.createPolicy('rtlPolicy', {
                        createHTML: (s) => s,
                    });
                }
                const wrapper = document.createElement('div');
                wrapper.innerHTML = window.__rtlPolicy.createHTML(htmlString);
                return wrapper.firstElementChild;
            } catch (e) { }
        }
        try {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = htmlString;
            return wrapper.firstElementChild;
        } catch (e) {
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlString, 'text/html');
                return doc.body.firstElementChild;
            } catch (err) {
                console.error('[Smart RTL] DOM creation error:', err);
                return null;
            }
        }
    }

    // ── Font Face Direct Loader ──────────────────────────────
    function loadFontFaceDirectly(targetDoc) {
        const doc = targetDoc || document;
        if (typeof FontFace === 'undefined' || !doc.fonts || !FONT_BASE64) return;

        try {
            let hasVazir = false;
            doc.fonts.forEach(f => {
                if (f.family === 'Vazirmatn' || f.family === 'PersianOnlyFont') hasVazir = true;
            });
            if (hasVazir) return;

            const binStr = atob(FONT_BASE64);
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
        } catch (e) { }
    }

    // ── Dynamic BiDi CSS Generation ──────────────────────────
    let rtlStyle = null;

    function createRTLStyleElement(doc = document) {
        let el = doc.getElementById('smart-rtl-style');
        if (!el) {
            el = doc.createElement('style');
            el.id = 'smart-rtl-style';
            doc.head.appendChild(el);
        }
        return el;
    }

    function updateDynamicCSS(doc = document) {
        const styleEl = createRTLStyleElement(doc);

        let faFontRule = '';
        let faFontName = "'Vazirmatn', 'PersianOnlyFont'";

        if (config.faFont) {
            faFontName = "'UserPersianFont', 'Vazirmatn', 'PersianOnlyFont'";
            const baseFaFont = config.faFont.replace(/[-\\s]?Regular$/i, '');
            faFontRule = \`
                @font-face {
                    font-family: 'UserPersianFont';
                    src: local('\${config.faFont}'), local('\${baseFaFont}');
                    font-weight: 400;
                    unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
                }
                @font-face {
                    font-family: 'UserPersianFont';
                    src: local('\${baseFaFont} Bold'), local('\${baseFaFont}-Bold'), local('\${baseFaFont}Bold');
                    font-weight: 700;
                    unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
                }
            \`;
        }

        const systemSans = '"Segoe WPC", "Segoe UI", -apple-system, BlinkMacSystemFont, system-ui, Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
        const enFontStr = config.enFont ? \`'\${config.enFont}', \${systemSans}\` : systemSans;
        const codeFontStr = config.codeFont ? \`'\${config.codeFont}', Consolas, "Courier New", monospace\` : 'Consolas, "Courier New", monospace';

        const forceRtlRule = config.forceRTL ? \`
            .prose > *:not(pre):not(code), 
            [data-testid="chat-message"] > *:not(pre):not(code), 
            .markdown-body > *:not(pre):not(code), 
            .leading-relaxed > *:not(pre):not(code),
            [data-testid="conversation-view"] p:not(pre):not(code),
            [data-testid="user-input-step"],
            [data-testid="user-input-step"] > *:not(pre):not(code),
            .cline-messages-container > *:not(pre):not(code),
            .continue-chat > *:not(pre):not(code),
            .roo-cline-messages > *:not(pre):not(code) {
                direction: rtl !important;
                text-align: right !important;
                unicode-bidi: isolate !important;
            }
        \` : '';

        const fontSrcs = \`local('Vazirmatn'), local('Vazirmatn Variable'), local('Vazir'), local('Vazir Code'),
                         url('./Vazirmatn-Variable.woff2') format('woff2'),
                         url('../../../../Vazirmatn-Variable.woff2') format('woff2'),
                         url('data:font/woff2;base64,\${FONT_BASE64}') format('woff2')\`;

        styleEl.textContent = \`
            \${faFontRule}

            @font-face {
                font-family: 'Vazirmatn';
                src: \${fontSrcs};
                font-weight: 100 900;
                font-style: normal;
                font-display: swap;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF, U+200C-200F;
            }
            @font-face {
                font-family: 'PersianOnlyFont';
                src: \${fontSrcs};
                font-weight: 100 900;
                font-style: normal;
                font-display: swap;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF, U+200C-200F;
            }

            :root, :host, body, .monaco-workbench, .monaco-workbench.windows {
                --vscode-font-family: \${faFontName}, \${enFontStr};
                font-family: \${faFontName}, \${enFontStr};
            }

            .codicon, [class*="codicon-"], [class*="codicon"], .codicon:before, [class*="codicon-"]:before, [class*="codicon"]:before,
            .monaco-tree-twistie, .monaco-tree-twistie:before {
                font-family: codicon !important;
            }

            .monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab .tab-label,
            .monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab .label-name,
            .monaco-workbench .part.editor > .content .editor-group-container > .title .title-label,
            .preferences-tabs-container, .settings-tabs-widget, .settings-tabs-widget *,
            .antigravity-statusbar-settings-panel .tabs-nav .tab-entry .tab-label {
                font-family: \${faFontName}, \${enFontStr} !important;
            }

            [data-testid="conversation-view"],
            [data-testid="conversation-view"] *:not(pre):not(code):not(.font-mono):not(.monaco-editor *):not(.codicon):not([class*="codicon"]):not([class*="codicon"] *),
            [data-testid="chat-message"],
            [data-testid="chat-message"] *:not(pre):not(code):not(.font-mono):not(.monaco-editor *):not(.codicon):not([class*="codicon"]):not([class*="codicon"] *),
            .prose,
            .prose *:not(pre):not(code):not(.font-mono):not(.monaco-editor *):not(.codicon):not([class*="codicon"]):not([class*="codicon"] *),
            .markdown-body,
            .markdown-body *:not(pre):not(code):not(.font-mono):not(.monaco-editor *):not(.codicon):not([class*="codicon"]):not([class*="codicon"] *),
            .leading-relaxed,
            .leading-relaxed *:not(pre):not(code):not(.font-mono):not(.monaco-editor *):not(.codicon):not([class*="codicon"]):not([class*="codicon"] *),
            [data-testid="user-input-step"],
            [data-testid="user-input-step"] *:not(pre):not(code):not(.font-mono):not(.monaco-editor *):not(.codicon):not([class*="codicon"]):not([class*="codicon"] *),
            [contenteditable="true"],
            [contenteditable="true"] *:not(pre):not(code):not(.font-mono):not(.monaco-editor *):not(.codicon):not([class*="codicon"]):not([class*="codicon"] *),
            .cline-messages-container, .continue-chat, .roo-cline-messages {
                font-family: \${faFontName}, \${enFontStr} !important;
            }

            .prose, [data-testid="chat-message"], .markdown-body, .leading-relaxed, 
            [data-testid="conversation-view"], [contenteditable="true"], [contenteditable="true"] p,
            .cline-messages-container, .continue-chat, .roo-cline-messages {
                font-size: \${config.fs}px !important;
            }

            .leading-relaxed, .prose p, .prose li, .markdown-body p, 
            [data-testid="conversation-view"] p, [data-testid="conversation-view"] li,
            [data-testid="user-input-step"], [contenteditable="true"], [contenteditable="true"] p,
            .cline-messages-container p, .continue-chat p, .roo-cline-messages p {
                line-height: \${config.lh} !important;
            }

            p, h1, h2, h3, h4, h5, h6, ul, ol {
                unicode-bidi: plaintext;
                text-align: start;
            }

            [dir="rtl"] {
                direction: rtl !important;
                text-align: right !important;
                unicode-bidi: isolate !important;
            }
            [dir="rtl"] p, [dir="rtl"] li, [dir="rtl"] h1, [dir="rtl"] h2, [dir="rtl"] h3, [dir="rtl"] h4, [dir="rtl"] h5, [dir="rtl"] h6 {
                direction: rtl !important;
                text-align: right !important;
                unicode-bidi: isolate !important;
            }

            [dir="ltr"] {
                direction: ltr !important;
                text-align: left !important;
                unicode-bidi: isolate !important;
            }
            [dir="ltr"] p, [dir="ltr"] li, [dir="ltr"] h1, [dir="ltr"] h2, [dir="ltr"] h3, [dir="ltr"] h4, [dir="ltr"] h5, [dir="ltr"] h6 {
                direction: ltr !important;
                text-align: left !important;
                unicode-bidi: isolate !important;
            }

            [role="radiogroup"], div:has(> [role="radiogroup"]) {
                direction: ltr !important;
                text-align: left !important;
            }

            label[for^="ask-opt-"], label[for^="ask-opt-"][dir="ltr"] {
                direction: ltr !important;
                text-align: left !important;
                justify-content: flex-start !important;
                align-items: flex-start !important;
            }
            label[for^="ask-opt-"] > div:first-of-type {
                order: 1 !important;
                margin-right: 0.5rem !important;
                margin-left: 0 !important;
                margin-top: 0.125rem !important;
            }
            label[for^="ask-opt-"] > span, label[for^="ask-opt-"] > div:last-child {
                order: 2 !important;
                text-align: left !important;
                direction: ltr !important;
                word-break: break-word !important;
            }

            label[for^="ask-opt-"][dir="rtl"] {
                direction: rtl !important;
                text-align: right !important;
                justify-content: flex-start !important;
                align-items: flex-start !important;
            }
            label[for^="ask-opt-"][dir="rtl"] > div:first-of-type {
                order: 1 !important;
                margin-left: 0.5rem !important;
                margin-right: 0 !important;
                margin-top: 0.125rem !important;
            }
            label[for^="ask-opt-"][dir="rtl"] > span, label[for^="ask-opt-"][dir="rtl"] > div:last-child {
                order: 2 !important;
                text-align: right !important;
                direction: rtl !important;
                word-break: break-word !important;
            }

            \${forceRtlRule}

            ul[dir="rtl"], ol[dir="rtl"], [dir="rtl"] ul, [dir="rtl"] ol,
            .leading-relaxed ul[dir="rtl"], .leading-relaxed ol[dir="rtl"],
            [data-testid="conversation-view"] ul[dir="rtl"], [data-testid="conversation-view"] ol[dir="rtl"],
            .prose ul[dir="rtl"], .prose ol[dir="rtl"],
            .cline-messages-container ul[dir="rtl"], .cline-messages-container ol[dir="rtl"] {
                direction: rtl !important;
                text-align: right !important;
                padding-left: 0 !important;
                padding-right: 1.5rem !important;
                margin-right: 0 !important;
            }

            ul[dir="rtl"] > li, ol[dir="rtl"] > li, [dir="rtl"] ul > li, [dir="rtl"] ol > li, li[dir="rtl"] {
                direction: rtl !important;
                text-align: right !important;
            }

            blockquote[dir="rtl"], [dir="rtl"] blockquote {
                direction: rtl !important;
                text-align: right !important;
                border-left: none !important;
                border-right: 4px solid var(--vscode-textBlockQuote-border, #3b82f6) !important;
                padding-left: 0.5rem !important;
                padding-right: 1rem !important;
            }

            table[dir="rtl"], [dir="rtl"] table {
                direction: rtl !important;
                text-align: right !important;
                border-collapse: collapse !important;
            }
            table[dir="rtl"] th, table[dir="rtl"] td, th[dir="rtl"], td[dir="rtl"] {
                direction: rtl !important;
                text-align: right !important;
            }
            table[dir="rtl"] code, [dir="rtl"] table code, table[dir="rtl"] pre, [dir="rtl"] table pre,
            th[dir="rtl"] code, td[dir="rtl"] code {
                direction: ltr !important;
                unicode-bidi: isolate !important;
                display: inline-block !important;
            }

            a[href^="file://"], a[href^="file:///"] {
                unicode-bidi: isolate !important;
                direction: ltr !important;
            }

            .cursor-edit.text-secondary-foreground, .cursor-edit.text-secondary-foreground * {
                direction: ltr !important;
                text-align: left !important;
                unicode-bidi: isolate !important;
            }

            pre, code, pre *, code *, .font-mono, .font-mono *, textarea.font-mono {
                unicode-bidi: isolate !important;
                direction: ltr !important;
                text-align: left !important;
                font-family: \${codeFontStr} !important;
            }
        \`;
    }

    // ── Widget UI Styles ─────────────────────────────────────
    function injectWidgetStyles(doc = document) {
        if (doc.getElementById('smart-rtl-widget-style')) return;
        const style = doc.createElement('style');
        style.id = 'smart-rtl-widget-style';
        style.textContent = \`
            /* Enable Titlebar Overflow for Dropdown */
            .monaco-workbench .part.titlebar,
            .monaco-workbench .part.titlebar > .titlebar-container,
            .monaco-workbench .part.titlebar .titlebar-right {
                overflow: visible !important;
            }

            /* Titlebar Alignment - anchor next to layout controls */
            .monaco-workbench .part.titlebar .titlebar-right > .rtl-header-wrap,
            .titlebar-right > .rtl-header-wrap {
                margin-left: auto !important;
            }
            .monaco-workbench .part.titlebar .titlebar-right > .rtl-header-wrap + .action-toolbar-container,
            .titlebar-right > .rtl-header-wrap + .action-toolbar-container {
                margin-left: 0 !important;
            }

            .rtl-header-wrap {
                position: relative !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                height: 100% !important;
                margin: 0 4px !important;
                -webkit-app-region: no-drag !important;
                app-region: no-drag !important;
                z-index: 10000 !important;
                user-select: none !important;
            }
            .rtl-header-button {
                position: relative !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 24px !important;
                height: 24px !important;
                min-width: 24px !important;
                min-height: 24px !important;
                border-radius: 4px !important;
                cursor: pointer !important;
                background: transparent !important;
                border: none !important;
                padding: 0 !important;
                margin: 0 !important;
                color: var(--vscode-titleBar-activeForeground, var(--vscode-icon-foreground, #cccccc)) !important;
                opacity: 0.85 !important;
                -webkit-app-region: no-drag !important;
                app-region: no-drag !important;
                pointer-events: auto !important;
                transition: all 0.15s ease !important;
            }
            .rtl-header-button:hover {
                opacity: 1 !important;
                color: var(--vscode-titleBar-activeForeground, #ffffff) !important;
                background-color: var(--vscode-toolbar-hoverBackground, rgba(90, 93, 94, 0.31)) !important;
            }
            .rtl-header-button.rtl-active {
                opacity: 1 !important;
                background-color: #0078d4 !important;
                color: #ffffff !important;
                box-shadow: 0 0 10px rgba(0, 120, 212, 0.7) !important;
            }
            .rtl-header-button.rtl-active:hover {
                background-color: #106ebe !important;
                color: #ffffff !important;
                box-shadow: 0 0 12px rgba(0, 120, 212, 0.9) !important;
            }
            .rtl-header-button.rtl-active svg {
                stroke: #ffffff !important;
                stroke-width: 2.3px !important;
                filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.8)) !important;
            }
            .rtl-header-button svg {
                width: 15px !important;
                height: 15px !important;
                stroke: currentColor !important;
                fill: none !important;
            }
            .rtl-status-dot {
                display: none !important;
            }
            .rtl-dropdown-panel {
                position: fixed !important;
                width: 260px !important;
                background-color: var(--vscode-menu-background, var(--vscode-sideBar-background, #18181b)) !important;
                color: var(--vscode-foreground, #f4f4f5) !important;
                border: 1px solid var(--vscode-widget-border, #3f3f46) !important;
                border-radius: 12px !important;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5) !important;
                padding: 12px 14px !important;
                box-sizing: border-box !important;
                transform: scale(0.95) translateY(-4px) !important;
                opacity: 0 !important;
                pointer-events: none !important;
                transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s ease !important;
                transform-origin: top right !important;
                font-size: 12px !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 7px !important;
                z-index: 2147483647 !important;
                -webkit-app-region: no-drag !important;
                app-region: no-drag !important;
            }
            .rtl-dropdown-panel.rtl-open {
                transform: scale(1) translateY(0) !important;
                opacity: 1 !important;
                pointer-events: auto !important;
            }
            .rtl-panel-header {
                text-align: center !important;
                font-weight: 600 !important;
                font-size: 13px !important;
                padding-bottom: 6px !important;
                border-bottom: 1px solid var(--vscode-widget-border, #3f3f46) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 6px !important;
            }
            .rtl-row {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                gap: 8px !important;
                margin: 2px 0 !important;
            }
            .rtl-label {
                font-weight: 500 !important;
                font-size: 11px !important;
                opacity: 0.85 !important;
                display: inline-flex !important;
                align-items: center !important;
                gap: 4px !important;
            }
            .rtl-separator {
                height: 1px !important;
                background-color: var(--vscode-widget-border, #3f3f46) !important;
                opacity: 0.4 !important;
                margin: 2px 0 !important;
            }
            .rtl-switch {
                position: relative !important;
                display: inline-flex !important;
                align-items: center !important;
                width: 36px !important;
                height: 19px !important;
                background-color: #4b5563 !important;
                border-radius: 9999px !important;
                cursor: pointer !important;
                transition: background-color 0.2s ease !important;
                border: none !important;
                padding: 0 !important;
                flex-shrink: 0 !important;
                outline: none !important;
            }
            .rtl-switch.rtl-on {
                background-color: #0078d4 !important;
                box-shadow: 0 0 8px rgba(0, 120, 212, 0.6) !important;
            }
            .rtl-switch.rtl-on:hover {
                background-color: #106ebe !important;
                box-shadow: 0 0 10px rgba(0, 120, 212, 0.8) !important;
            }
            .rtl-switch-knob {
                position: absolute !important;
                width: 13px !important;
                height: 13px !important;
                background-color: #ffffff !important;
                border-radius: 50% !important;
                left: 3px !important;
                transition: transform 0.2s ease !important;
                box-shadow: 0 1px 3px rgba(0,0,0,0.4) !important;
            }
            .rtl-switch.rtl-on .rtl-switch-knob {
                transform: translateX(17px) !important;
            }
            .rtl-input {
                background-color: var(--vscode-input-background, #27272a) !important;
                color: var(--vscode-input-foreground, #f4f4f5) !important;
                border: 1px solid var(--vscode-input-border, #3f3f46) !important;
                border-radius: 6px !important;
                padding: 3px 6px !important;
                font-size: 11px !important;
                width: 110px !important;
                box-sizing: border-box !important;
                outline: none !important;
                transition: border-color 0.2s !important;
            }
            .rtl-input:focus {
                border-color: var(--vscode-focusBorder, #3b82f6) !important;
            }
            .rtl-slider-wrap {
                display: flex !important;
                align-items: center !important;
                gap: 6px !important;
            }
            .rtl-slider {
                width: 75px !important;
                height: 4px !important;
                cursor: pointer !important;
                accent-color: var(--vscode-button-background, #3b82f6) !important;
            }
            .rtl-icon-btn {
                background: none !important;
                border: none !important;
                color: var(--vscode-foreground, #a1a1aa) !important;
                opacity: 0.6 !important;
                cursor: pointer !important;
                padding: 0 !important;
                display: inline-flex !important;
                align-items: center !important;
                transition: opacity 0.2s !important;
            }
            .rtl-icon-btn:hover {
                opacity: 1 !important;
            }
            .rtl-info {
                position: relative !important;
                display: inline-flex !important;
                cursor: help !important;
            }
            .rtl-tooltip {
                visibility: hidden !important;
                opacity: 0 !important;
                position: absolute !important;
                bottom: 120% !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                background-color: #18181b !important;
                color: #f4f4f5 !important;
                border: 1px solid #3f3f46 !important;
                padding: 5px 8px !important;
                border-radius: 6px !important;
                font-size: 10px !important;
                line-height: 1.3 !important;
                white-space: normal !important;
                width: 170px !important;
                text-align: center !important;
                z-index: 100000000 !important;
                box-shadow: 0 4px 10px rgba(0,0,0,0.5) !important;
                pointer-events: none !important;
                transition: opacity 0.2s ease !important;
            }
            .rtl-info:hover .rtl-tooltip {
                visibility: visible !important;
                opacity: 1 !important;
            }
            .rtl-github {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 5px !important;
                color: var(--vscode-foreground, #a1a1aa) !important;
                text-decoration: none !important;
                font-size: 11px !important;
                padding-top: 3px !important;
                opacity: 0.75 !important;
                transition: opacity 0.2s, color 0.2s !important;
            }
            .rtl-github:hover {
                opacity: 1 !important;
                color: #f59e0b !important;
            }
            .rtl-header-wrap.rtl-floating {
                position: fixed !important;
                bottom: 16px !important;
                right: 16px !important;
                z-index: 999999 !important;
                background-color: var(--vscode-menu-background, #18181b) !important;
                border: 1px solid var(--vscode-widget-border, #3f3f46) !important;
                border-radius: 8px !important;
                padding: 4px !important;
                box-shadow: 0 4px 14px rgba(0,0,0,0.4) !important;
            }
            .rtl-header-wrap.rtl-floating .rtl-dropdown-panel {
                top: auto !important;
                bottom: calc(100% + 8px) !important;
                transform-origin: bottom right !important;
            }
        \`;
        doc.head.appendChild(style);
    }

    // ── Target Adapter Detection ─────────────────────────────
    function getActiveAdapterSelectors(doc = document) {
        // Universal selectors union across Antigravity, Cline, Continue, Roo Code
        return {
            messages: [
                '.prose > p', '.prose > h1', '.prose > h2', '.prose > h3', '.prose > h4', '.prose > h5', '.prose > h6', '.prose > blockquote',
                '.leading-relaxed p', '.leading-relaxed h1', '.leading-relaxed h2', '.leading-relaxed h3', '.leading-relaxed h4', '.leading-relaxed h5', '.leading-relaxed h6', '.leading-relaxed blockquote',
                '[data-testid="conversation-view"] p',
                '[data-testid="conversation-view"] h1',
                '[data-testid="conversation-view"] h2',
                '[data-testid="conversation-view"] h3',
                '[data-testid="conversation-view"] blockquote',
                '[data-testid="chat-message"] p',
                '[data-testid="user-input-step"]',
                '[data-testid="user-input-step"] > *',
                '.cline-messages-container p', '.cline-messages-container h1', '.cline-messages-container h2', '.cline-messages-container blockquote',
                '.continue-chat p', '.continue-chat h1', '.continue-chat h2', '.continue-chat blockquote',
                '.roo-cline-messages p', '.roo-cline-messages h1', '.roo-cline-messages h2', '.roo-cline-messages blockquote',
                'label[for^="ask-opt-"]'
            ],
            inputs: [
                '[contenteditable="true"] p',
                '[contenteditable="true"]',
                'textarea[data-testid="ask-question-writein"]',
                'textarea[placeholder]',
                'textarea.continue-input',
                'textarea'
            ],
            lists: [
                '[data-testid="conversation-view"] ul', '[data-testid="conversation-view"] ol',
                '.leading-relaxed ul', '.leading-relaxed ol',
                '.prose ul', '.prose ol',
                '.cline-messages-container ul', '.cline-messages-container ol',
                '.continue-chat ul', '.continue-chat ol',
                '.roo-cline-messages ul', '.roo-cline-messages ol'
            ],
            tables: [
                'table'
            ],
            anchor: [
                '[data-tooltip-id="new-conversation-tooltip"]',
                '[data-past-conversations-toggle="true"]',
                '.cline-header-buttons',
                '.continue-header-actions',
                '.roo-header-actions',
                '.composite.title .title-actions',
                '.pane-header .actions',
                '.toolbar-actions',
                '.header-actions',
                '.action-bar'
            ]
        };
    }

    // ── Direction Processing ─────────────────────────────────
    function updateDOMDirection(targetDoc) {
        if (!config.isRTL) return;
        const doc = targetDoc || document;
        const selectors = getActiveAdapterSelectors(doc);

        // 1. Inputs
        doc.querySelectorAll(selectors.inputs.join(', ')).forEach(el => {
            if (el.classList.contains('font-mono') || el.closest('.monaco-editor')) return;
            const text = cleanText(el.tagName === 'TEXTAREA' || el.tagName === 'INPUT' ? el.value : el.textContent);
            if (text.length > 0) {
                const newDir = (config.forceRTL || hasPersianText(text)) ? 'rtl' : 'ltr';
                if (el.getAttribute('dir') !== newDir) el.setAttribute('dir', newDir);
            } else {
                if (el.hasAttribute('dir')) el.removeAttribute('dir');
            }
        });

        // 2. Lists
        doc.querySelectorAll(selectors.lists.join(', ')).forEach(listEl => {
            if (listEl.closest('.monaco-editor') || listEl.closest('pre')) return;

            let listHasPersian = false;
            listEl.querySelectorAll(':scope > li').forEach(li => {
                const clean = getCleanElementText(li);
                const hasFa = hasPersianText(clean);
                const dir = (hasFa || config.forceRTL) ? 'rtl' : 'ltr';
                if (hasFa) listHasPersian = true;

                if (li.getAttribute('dir') !== dir) li.setAttribute('dir', dir);
                li.querySelectorAll('p').forEach(p => {
                    if (p.getAttribute('dir') !== dir) p.setAttribute('dir', dir);
                });
            });

            const targetDir = (listHasPersian || config.forceRTL) ? 'rtl' : 'ltr';
            if (listEl.getAttribute('dir') !== targetDir) {
                listEl.setAttribute('dir', targetDir);
            }
        });

        // 3. Headings, Paragraphs, Quotes
        doc.querySelectorAll(selectors.messages.join(', ')).forEach(el => {
            if (
                el.tagName === 'PRE' ||
                el.tagName === 'CODE' ||
                el.classList.contains('font-mono') ||
                el.closest('pre') ||
                el.closest('.monaco-editor') ||
                el.closest('li')
            ) return;

            let textToCheck = el.textContent || '';
            if (el.matches('label[for^="ask-opt-"]')) {
                const textSpan = el.querySelector(':scope > span:not(.font-mono), :scope > div:last-child');
                if (textSpan) textToCheck = textSpan.textContent || '';
            }

            const clean = cleanText(textToCheck);
            let dir = 'ltr';
            if (config.forceRTL && !el.matches('label[for^="ask-opt-"]')) {
                dir = 'rtl';
            } else if (clean) {
                dir = hasPersianText(clean) ? 'rtl' : 'ltr';
            }

            if (el.getAttribute('dir') !== dir) {
                el.setAttribute('dir', dir);
            }
        });

        // 4. Tables
        doc.querySelectorAll(selectors.tables.join(', ')).forEach(table => {
            if (table.closest('.monaco-editor')) return;

            const clean = getCleanElementText(table);
            const hasFa = hasPersianText(clean);
            const targetDir = (hasFa || config.forceRTL) ? 'rtl' : 'ltr';

            if (table.getAttribute('dir') !== targetDir) table.setAttribute('dir', targetDir);
            table.querySelectorAll('th, td').forEach(cell => {
                if (cell.getAttribute('dir') !== targetDir) cell.setAttribute('dir', targetDir);
            });

            const parent = table.parentElement;
            if (parent && parent.tagName === 'DIV') {
                if (targetDir === 'rtl') {
                    if (parent.getAttribute('dir') !== 'rtl') parent.setAttribute('dir', 'rtl');
                } else {
                    if (parent.getAttribute('dir') === 'rtl') parent.removeAttribute('dir');
                }
            }
        });
    }

    // ── Smart 3-Stage Widget Anchoring ───────────────────────
    let widgetWrapper = null;
    let currentLocation = null;

    function buildWidget() {
        if (widgetWrapper) return widgetWrapper;

        const html = \`
            <div id="smart-rtl-wrap" class="rtl-header-wrap">
              <button id="smart-rtl-btn" 
                      type="button" 
                      class="rtl-header-button \${config.isRTL ? 'rtl-active' : ''}" 
                      title="Smart RTL (Alt+R)" 
                      aria-label="Smart RTL">
                <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M2 12h20"></path>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                <span class="rtl-status-dot"></span>
              </button>

              <div id="smart-rtl-panel" class="rtl-dropdown-panel">
                <div class="rtl-panel-header">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                  <span>Smart RTL</span>
                </div>

                <div class="rtl-row">
                  <span class="rtl-label">
                    <span id="rtl-toggle-label">\${config.isRTL ? 'Enabled' : 'Disabled'}</span>
                    <span class="rtl-info">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                      <span class="rtl-tooltip">Shortcut: Alt + R</span>
                    </span>
                  </span>
                  <button id="rtl-toggle-btn" type="button" class="rtl-switch \${config.isRTL ? 'rtl-on' : ''}">
                    <span class="rtl-switch-knob"></span>
                  </button>
                </div>

                <div class="rtl-row">
                  <span class="rtl-label">
                    <span>Force RTL</span>
                    <span class="rtl-info">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                      <span class="rtl-tooltip">Forces all text blocks to RTL even if starting with English words</span>
                    </span>
                  </span>
                  <button id="rtl-force-btn" type="button" class="rtl-switch \${config.forceRTL ? 'rtl-on' : ''}">
                    <span class="rtl-switch-knob"></span>
                  </button>
                </div>

                <div class="rtl-separator"></div>

                <div class="rtl-row">
                  <span class="rtl-label" title="Persian Font (Default: Vazirmatn)">FA Font</span>
                  <input id="rtl-fafont-input" type="text" class="rtl-input" placeholder="Default: Vazirmatn" value="\${config.faFont || ''}">
                </div>

                <div class="rtl-row">
                  <span class="rtl-label" title="English Font">EN Font</span>
                  <input id="rtl-enfont-input" type="text" class="rtl-input" placeholder="Default: System" value="\${config.enFont || ''}">
                </div>

                <div class="rtl-row">
                  <span class="rtl-label" title="Code Monospace Font">Code Font</span>
                  <input id="rtl-codefont-input" type="text" class="rtl-input" placeholder="Default: Monospace" value="\${config.codeFont || ''}">
                </div>

                <div class="rtl-row">
                  <span class="rtl-label">Line Height</span>
                  <div class="rtl-slider-wrap">
                    <input id="rtl-lh-input" type="range" min="1.2" max="2.5" step="0.1" value="\${config.lh || '1.6'}" class="rtl-slider">
                    <button id="rtl-lh-reset" type="button" class="rtl-icon-btn" title="Reset to 1.6">↺</button>
                  </div>
                </div>

                <div class="rtl-row">
                  <span class="rtl-label">Font Size</span>
                  <div class="rtl-slider-wrap">
                    <input id="rtl-fs-input" type="range" min="11" max="22" step="1" value="\${config.fs || '16'}" class="rtl-slider">
                    <button id="rtl-fs-reset" type="button" class="rtl-icon-btn" title="Reset to 16px">↺</button>
                  </div>
                </div>

                <div class="rtl-separator"></div>

                <div class="rtl-row">
                  <span class="rtl-label">
                    <span>Shift+2 for @</span>
                    <span class="rtl-info">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                      <span class="rtl-tooltip">Types '@' instead of '٬' when using Persian keyboard</span>
                    </span>
                  </span>
                  <button id="rtl-at-btn" type="button" class="rtl-switch \${config.fixAtSign !== false ? 'rtl-on' : ''}">
                    <span class="rtl-switch-knob"></span>
                  </button>
                </div>

                <div class="rtl-separator"></div>

                <a href="https://github.com/Masoud-Kakouei/Smart-RTL" target="_blank" class="rtl-github">
                  <svg height="13" width="13" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
                  <span>Star on GitHub</span>
                </a>
              </div>
            </div>
        \`;

        widgetWrapper = safeCreateElement(html);
        wireWidgetEvents(widgetWrapper);
        return widgetWrapper;
    }

    function wireWidgetEvents(wrapper) {
        if (!wrapper) return;

        const btn = wrapper.querySelector('#smart-rtl-btn');
        const panel = wrapper.querySelector('#smart-rtl-panel');
        const toggleBtn = wrapper.querySelector('#rtl-toggle-btn');
        const toggleLabel = wrapper.querySelector('#rtl-toggle-label');
        const forceBtn = wrapper.querySelector('#rtl-force-btn');
        const atBtn = wrapper.querySelector('#rtl-at-btn');
        const faFontInput = wrapper.querySelector('#rtl-fafont-input');
        const enFontInput = wrapper.querySelector('#rtl-enfont-input');
        const codeFontInput = wrapper.querySelector('#rtl-codefont-input');
        const lhInput = wrapper.querySelector('#rtl-lh-input');
        const lhResetBtn = wrapper.querySelector('#rtl-lh-reset');
        const fsInput = wrapper.querySelector('#rtl-fs-input');
        const fsResetBtn = wrapper.querySelector('#rtl-fs-reset');

        function updatePanelPosition() {
            if (!panel || !btn) return;
            const rect = btn.getBoundingClientRect();
            panel.style.top = Math.round(rect.bottom + 4) + 'px';
            panel.style.right = Math.max(8, Math.round(window.innerWidth - rect.right)) + 'px';
            panel.style.left = 'auto';
        }

        btn?.addEventListener('click', (e) => {
            e.stopPropagation();
            updatePanelPosition();
            panel?.classList.toggle('rtl-open');
        });

        window.addEventListener('resize', () => {
            if (panel?.classList.contains('rtl-open')) {
                updatePanelPosition();
            }
        });

        const closePanelOnOutside = (e) => {
            if (!panel || !panel.classList.contains('rtl-open')) return;
            const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
            if (path.includes(wrapper) || path.includes(panel) || wrapper.contains(e.target) || panel.contains(e.target)) {
                return;
            }
            panel.classList.remove('rtl-open');
        };

        window.addEventListener('pointerdown', closePanelOnOutside, { capture: true });
        window.addEventListener('mousedown', closePanelOnOutside, { capture: true });
        window.addEventListener('click', closePanelOnOutside, { capture: true });
        window.addEventListener('blur', () => {
            if (panel?.classList.contains('rtl-open')) {
                panel.classList.remove('rtl-open');
            }
        });
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && panel?.classList.contains('rtl-open')) {
                panel.classList.remove('rtl-open');
            }
        }, { capture: true });

        function persist() {
            config.faFont = faFontInput?.value.trim() || '';
            config.enFont = enFontInput?.value.trim() || '';
            config.codeFont = codeFontInput?.value.trim() || '';
            config.lh = lhInput?.value || '1.6';
            config.fs = fsInput?.value || '16';
            saveConfig();
            updateDynamicCSS(document);
            updateDOMDirection();
        }

        function setRTLState(active) {
            config.isRTL = active;
            saveConfig();

            if (config.isRTL) {
                if (toggleLabel) toggleLabel.textContent = 'Enabled';
                toggleBtn?.classList.add('rtl-on');
                btn?.classList.add('rtl-active');
                updateDynamicCSS(document);
                updateDOMDirection();
            } else {
                if (toggleLabel) toggleLabel.textContent = 'Disabled';
                toggleBtn?.classList.remove('rtl-on');
                btn?.classList.remove('rtl-active');
                const styleEl = document.getElementById('smart-rtl-style');
                if (styleEl?.parentNode) styleEl.parentNode.removeChild(styleEl);
                document.querySelectorAll('[dir="rtl"]').forEach(el => el.removeAttribute('dir'));
            }
        }

        toggleBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            setRTLState(!config.isRTL);
        });

        forceBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            config.forceRTL = !config.forceRTL;
            forceBtn.classList.toggle('rtl-on', config.forceRTL);
            saveConfig();
            updateDynamicCSS(document);
            updateDOMDirection();
        });

        atBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            config.fixAtSign = !config.fixAtSign;
            atBtn.classList.toggle('rtl-on', config.fixAtSign);
            saveConfig();
        });

        [faFontInput, enFontInput, codeFontInput, lhInput, fsInput].forEach(inp => {
            inp?.addEventListener('input', persist);
        });

        lhResetBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (lhInput) lhInput.value = '1.6';
            persist();
        });

        fsResetBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (fsInput) fsInput.value = '16';
            persist();
        });

        // Alt + R Shortcut
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.code === 'KeyR') {
                e.preventDefault();
                setRTLState(!config.isRTL);
            }
        });

        // Shift + 2 Persian @ Fix
        document.addEventListener('keydown', (e) => {
            if (config.fixAtSign === false) return;
            if (e.code === 'Digit2' && e.shiftKey) {
                if (e.key === '٬' || e.key === '،') {
                    e.preventDefault();
                    if (document.queryCommandSupported && document.queryCommandSupported('insertText')) {
                        document.execCommand('insertText', false, '@');
                    }
                }
            }
        }, { capture: true });
    }

    function attachWidget() {
        const widget = buildWidget();
        if (!widget) return;

        // Stage 1: VS Code & Antigravity IDE Title Bar (Right section, beside Layout Controls)
        const titlebarRight = document.querySelector(
            '.part.titlebar .titlebar-right, #workbench\\.parts\\.titlebar .titlebar-right, .titlebar-container .titlebar-right, .titlebar-right'
        );
        if (titlebarRight) {
            const actionToolbar = titlebarRight.querySelector('.action-toolbar-container');
            if (actionToolbar) {
                if (widget.parentElement !== actionToolbar || actionToolbar.firstElementChild !== widget) {
                    widget.classList.remove('rtl-floating');
                    actionToolbar.prepend(widget);
                    currentLocation = 'titlebar';
                }
                return;
            }

            const windowControls = titlebarRight.querySelector('.window-controls-container');
            if (windowControls) {
                if (widget.parentElement !== titlebarRight || widget.nextElementSibling !== windowControls) {
                    widget.classList.remove('rtl-floating');
                    titlebarRight.insertBefore(widget, windowControls);
                    currentLocation = 'titlebar';
                }
                return;
            }

            if (widget.parentElement !== titlebarRight) {
                widget.classList.remove('rtl-floating');
                titlebarRight.appendChild(widget);
                currentLocation = 'titlebar';
            }
            return;
        }

        // Stage 2: Generic action bars
        const actionBars = [
            '.cline-header-buttons',
            '.continue-header-actions',
            '.roo-header-actions',
            '.composite.title .title-actions',
            '.pane-header .actions',
            '.editor-group-container .title .tabs-and-actions-container .editor-actions',
            '.toolbar-actions',
            '.header-actions',
            '.action-bar'
        ];

        for (const sel of actionBars) {
            const bar = document.querySelector(sel);
            if (bar && bar.parentElement) {
                if (widget.parentElement !== bar) {
                    widget.classList.remove('rtl-floating');
                    bar.prepend(widget);
                    currentLocation = 'actionbar';
                }
                return;
            }
        }

        // Check if inside iframe/webview: do not float in the corner
        const isInsideIframe = () => {
            try { return window.self !== window.top; } catch(e) { return true; }
        };
        if (isInsideIframe()) {
            return;
        }

        // Stage 3: Corner floating fallback (only for standalone top-level windows)
        if (currentLocation !== 'floating' || !document.body.contains(widget)) {
            widget.classList.add('rtl-floating');
            document.body.appendChild(widget);
            currentLocation = 'floating';
        }
    }

    // ── Cascade to Webviews and Iframes ──────────────────────
    function cascadeToFrames() {
        document.querySelectorAll('iframe, webview').forEach(frame => {
            try {
                const doc = frame.contentDocument;
                if (doc && doc.head && !doc.getElementById('smart-rtl-style')) {
                    loadFontFaceDirectly(doc);
                    injectWidgetStyles(doc);
                    updateDynamicCSS(doc);
                    updateDOMDirection(doc);
                }
            } catch (e) { }
        });
    }

    // ── High-Performance Debounced Observer ──────────────────
    let isScheduled = false;
    function scheduleUpdate() {
        if (!isScheduled) {
            isScheduled = true;
            window.requestAnimationFrame(() => {
                attachWidget();
                updateDOMDirection();
                cascadeToFrames();
                isScheduled = false;
            });
        }
    }

    // ── Initialization ───────────────────────────────────────
    function init() {
        loadFontFaceDirectly(document);
        injectWidgetStyles(document);
        if (config.isRTL) {
            updateDynamicCSS(document);
        }

        attachWidget();
        updateDOMDirection();
        cascadeToFrames();

        // Event-driven direction update
        document.body.addEventListener('input', scheduleUpdate, { capture: true });
        document.body.addEventListener('focusin', scheduleUpdate, { capture: true });

        // Debounced MutationObserver (No expensive tight polling)
        const observer = new MutationObserver(() => {
            scheduleUpdate();
        });
        observer.observe(document.body, { childList: true, subtree: true });

        // Low-frequency safety net (every 3 seconds instead of 500ms)
        setInterval(() => {
            if (!widgetWrapper || !document.body.contains(widgetWrapper) || currentLocation !== 'titlebar') {
                attachWidget();
            }
            cascadeToFrames();
        }, 3000);
    }

    function tryInit() {
        if (!document.body) {
            window.requestAnimationFrame(tryInit);
            return;
        }
        init();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInit);
    } else {
        setTimeout(tryInit, 50);
    }
})();
`;
}

// Generate payloads
const idePayload = buildClientPayload({ targetName: "antigravity-ide" });
const vscodePayload = buildClientPayload({ targetName: "vscode" });
const chatPayload = buildClientPayload({ targetName: "antigravity-chat" });

// Ensure output dirs exist
fs.mkdirSync(path.join(rootDir, "dist"), { recursive: true });
fs.mkdirSync(path.join(rootDir, "bin"), { recursive: true });

// Write dist files
fs.writeFileSync(
  path.join(rootDir, "dist", "antigravity-ide.payload.js"),
  idePayload,
  "utf8",
);
fs.writeFileSync(
  path.join(rootDir, "dist", "vscode.payload.js"),
  vscodePayload,
  "utf8",
);
fs.writeFileSync(
  path.join(rootDir, "dist", "antigravity-chat.payload.js"),
  chatPayload,
  "utf8",
);

// Copy default payload and font to bin/ for standalone npm package distribution
fs.writeFileSync(
  path.join(rootDir, "bin", "smart-rtl.payload.js"),
  idePayload,
  "utf8",
);
fs.copyFileSync(
  fontPath,
  path.join(rootDir, "bin", "Vazirmatn-Variable.woff2"),
);

console.log("✅ Successfully built Smart RTL payloads:");
console.log(
  "  • dist/antigravity-ide.payload.js (" +
    (idePayload.length / 1024).toFixed(1) +
    " KB)",
);
console.log(
  "  • dist/vscode.payload.js (" +
    (vscodePayload.length / 1024).toFixed(1) +
    " KB)",
);
console.log(
  "  • dist/antigravity-chat.payload.js (" +
    (chatPayload.length / 1024).toFixed(1) +
    " KB)",
);
console.log("  • bin/smart-rtl.payload.js");
