/**
 * Smart RTL - BiDi CSS Generator
 * Produces complete, battle-tested CSS rules for RTL text rendering,
 * fonts, lists, tables, inputs, tabs, and code preservation.
 */

export function generateBiDiCSS(options = {}) {
    const {
        faFont = '',
        enFont = '',
        codeFont = '',
        lh = '1.6',
        fs = '16',
        forceRTL = false,
        fontBase64 = ''
    } = options;

    let faFontRule = '';
    let faFontName = "'Vazirmatn', 'PersianOnlyFont'";

    if (faFont) {
        faFontName = "'UserPersianFont', 'Vazirmatn', 'PersianOnlyFont'";
        const baseFaFont = faFont.replace(/[-\s]?Regular$/i, '');
        faFontRule = `
            @font-face {
                font-family: 'UserPersianFont';
                src: local('${faFont}'), local('${baseFaFont}');
                font-weight: 400;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
            @font-face {
                font-family: 'UserPersianFont';
                src: local('${baseFaFont} Bold'), local('${baseFaFont}-Bold'), local('${baseFaFont}Bold');
                font-weight: 700;
                unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
            }
        `;
    }

    const systemSans = '"Segoe WPC", "Segoe UI", -apple-system, BlinkMacSystemFont, system-ui, Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
    const enFontStr = enFont ? `'${enFont}', ${systemSans}` : systemSans;
    const codeFontStr = codeFont
        ? `'${codeFont}', Consolas, "Courier New", monospace`
        : 'Consolas, "Courier New", monospace';

    const forceRtlRule = forceRTL ? `
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
    ` : '';

    const fontSrcs = [
        "local('Vazirmatn')",
        "local('Vazirmatn Variable')",
        "local('Vazir')",
        "local('Vazir Code')",
        "url('./Vazirmatn-Variable.woff2') format('woff2')",
        "url('../../../../Vazirmatn-Variable.woff2') format('woff2')",
        fontBase64 ? `url('data:font/woff2;base64,${fontBase64}') format('woff2')` : ''
    ].filter(Boolean).join(',\n                 ');

    return `
        ${faFontRule}

        /* Vazirmatn Variable Font Definition */
        @font-face {
            font-family: 'Vazirmatn';
            src: ${fontSrcs};
            font-weight: 100 900;
            font-style: normal;
            font-display: swap;
            unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF, U+200C-200F;
        }
        @font-face {
            font-family: 'PersianOnlyFont';
            src: ${fontSrcs};
            font-weight: 100 900;
            font-style: normal;
            font-display: swap;
            unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF, U+200C-200F;
        }

        /* Explicit weights for maximum Chromium compatibility */
        @font-face {
            font-family: 'Vazirmatn';
            src: ${fontSrcs};
            font-weight: 400;
            font-style: normal;
            font-display: swap;
            unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF, U+200C-200F;
        }
        @font-face {
            font-family: 'PersianOnlyFont';
            src: ${fontSrcs};
            font-weight: 400;
            font-style: normal;
            font-display: swap;
            unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF, U+200C-200F;
        }
        @font-face {
            font-family: 'Vazirmatn';
            src: ${fontSrcs};
            font-weight: 500;
            font-style: normal;
            font-display: swap;
            unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF, U+200C-200F;
        }
        @font-face {
            font-family: 'PersianOnlyFont';
            src: ${fontSrcs};
            font-weight: 500;
            font-style: normal;
            font-display: swap;
            unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF, U+200C-200F;
        }
        @font-face {
            font-family: 'Vazirmatn';
            src: ${fontSrcs};
            font-weight: 600;
            font-style: normal;
            font-display: swap;
            unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF, U+200C-200F;
        }
        @font-face {
            font-family: 'PersianOnlyFont';
            src: ${fontSrcs};
            font-weight: 600;
            font-style: normal;
            font-display: swap;
            unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF, U+200C-200F;
        }
        @font-face {
            font-family: 'Vazirmatn';
            src: ${fontSrcs};
            font-weight: 700;
            font-style: normal;
            font-display: swap;
            unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF, U+200C-200F;
        }
        @font-face {
            font-family: 'PersianOnlyFont';
            src: ${fontSrcs};
            font-weight: 700;
            font-style: normal;
            font-display: swap;
            unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF, U+200C-200F;
        }

        /* Base Typography for Workbench */
        :root, :host, body, .monaco-workbench, .monaco-workbench.windows {
            --vscode-font-family: ${faFontName}, ${enFontStr};
            font-family: ${faFontName}, ${enFontStr};
        }

        /* Preserve all VS Code & Extension Codicons strictly */
        .codicon,
        [class*="codicon-"],
        [class*="codicon"],
        .codicon:before,
        [class*="codicon-"]:before,
        [class*="codicon"]:before,
        .monaco-tree-twistie,
        .monaco-tree-twistie:before,
        .monaco-icon-label:before,
        .show-file-icons .file-icon:before {
            font-family: codicon !important;
        }

        /* Uniform tab typography across all editors and settings */
        .monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab,
        .monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab .tab-label,
        .monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab .tab-label a,
        .monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab .label-name,
        .monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab .label-description,
        .monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab .monaco-icon-label,
        .monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab .monaco-icon-name-container,
        .monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab .monaco-icon-description-container,
        .monaco-workbench .part.editor > .content .editor-group-container > .title .title-label,
        .monaco-workbench .part.editor > .content .editor-group-container > .title .title-label a,
        .monaco-workbench .part.editor > .content .editor-group-container > .title .title-label .label-name,
        .monaco-workbench .part.editor > .content .editor-group-container > .title .title-label .label-description,
        .monaco-workbench .part.editor > .content .editor-group-container > .title .tab-label span:not(.codicon):not([class*="codicon"]),
        .preferences-tabs-container,
        .settings-tabs-widget,
        .settings-tabs-widget *,
        .antigravity-statusbar-settings-panel .tabs-nav .tab-entry .tab-label {
            font-family: ${faFontName}, ${enFontStr} !important;
        }

        /* Persian typography in chat panels, extension views, artifacts, and prompts */
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
        .monaco-editor-pane,
        .monaco-editor-pane *:not(pre):not(code):not(.font-mono):not(.monaco-editor *):not(.codicon):not([class*="codicon"]):not([class*="codicon"] *),
        .cline-messages-container,
        .cline-messages-container *:not(pre):not(code):not(.font-mono):not(.monaco-editor *):not(.codicon):not([class*="codicon"]):not([class*="codicon"] *),
        .continue-chat,
        .continue-chat *:not(pre):not(code):not(.font-mono):not(.monaco-editor *):not(.codicon):not([class*="codicon"]):not([class*="codicon"] *),
        .roo-cline-messages,
        .roo-cline-messages *:not(pre):not(code):not(.font-mono):not(.monaco-editor *):not(.codicon):not([class*="codicon"]):not([class*="codicon"] *) {
            font-family: ${faFontName}, ${enFontStr} !important;
        }

        /* Configurable Font Size */
        .prose, [data-testid="chat-message"], .markdown-body, .leading-relaxed, 
        [data-testid="conversation-view"], [contenteditable="true"], [contenteditable="true"] p,
        .cline-messages-container, .continue-chat, .roo-cline-messages {
            font-size: ${fs}px !important;
        }

        /* Configurable Line Height */
        .leading-relaxed, .prose p, .prose li, .markdown-body p, 
        [data-testid="conversation-view"] p, [data-testid="conversation-view"] li,
        [data-testid="user-input-step"], [contenteditable="true"], [contenteditable="true"] p,
        .cline-messages-container p, .continue-chat p, .roo-cline-messages p {
            line-height: ${lh} !important;
        }

        /* Natural bidi alignment for paragraphs and headings */
        p, h1, h2, h3, h4, h5, h6, ul, ol {
            unicode-bidi: plaintext;
            text-align: start;
        }
        .prose p, .prose li, .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6,
        [data-testid="chat-message"] p, [data-testid="chat-message"] li,
        .markdown-body p, .markdown-body li,
        .leading-relaxed p, .leading-relaxed li,
        [data-testid="conversation-view"] p, [data-testid="conversation-view"] li,
        .cline-messages-container p, .continue-chat p, .roo-cline-messages p {
            unicode-bidi: plaintext;
            text-align: start;
        }

        /* When RTL is explicitly applied: direction and text-align with isolate override */
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

        /* Interactive cards and ask-option questions: default strictly to LTR */
        [role="radiogroup"],
        div:has(> [role="radiogroup"]) {
            direction: ltr !important;
            text-align: left !important;
        }

        label[for^="ask-opt-"],
        label[for^="ask-opt-"][dir="ltr"] {
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
        label[for^="ask-opt-"] > span,
        label[for^="ask-opt-"] > div:last-child {
            order: 2 !important;
            text-align: left !important;
            direction: ltr !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
        }

        /* Only explicitly Persian options get RTL flipped */
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
        label[for^="ask-opt-"][dir="rtl"] > span,
        label[for^="ask-opt-"][dir="rtl"] > div:last-child {
            order: 2 !important;
            text-align: right !important;
            direction: rtl !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
        }

        ${forceRtlRule}

        /* RTL Lists (ul, ol, li) - Complete Right-to-Left alignment & padding */
        ul[dir="rtl"], ol[dir="rtl"],
        [dir="rtl"] ul, [dir="rtl"] ol,
        .leading-relaxed ul[dir="rtl"], .leading-relaxed ol[dir="rtl"],
        [data-testid="conversation-view"] ul[dir="rtl"], [data-testid="conversation-view"] ol[dir="rtl"],
        .prose ul[dir="rtl"], .prose ol[dir="rtl"] {
            direction: rtl !important;
            text-align: right !important;
            padding-left: 0 !important;
            padding-right: 1.5rem !important;
            margin-right: 0 !important;
        }

        ul[dir="rtl"] > li, ol[dir="rtl"] > li,
        [dir="rtl"] ul > li, [dir="rtl"] ol > li,
        li[dir="rtl"],
        .leading-relaxed li[dir="rtl"],
        [data-testid="conversation-view"] li[dir="rtl"] {
            direction: rtl !important;
            text-align: right !important;
        }

        /* Nested RTL lists */
        ul[dir="rtl"] ul, ul[dir="rtl"] ol, ol[dir="rtl"] ul, ol[dir="rtl"] ol,
        [dir="rtl"] ul ul, [dir="rtl"] ul ol, [dir="rtl"] ol ul, [dir="rtl"] ol ol {
            padding-left: 0 !important;
            padding-right: 1.5rem !important;
        }

        /* RTL Blockquotes */
        blockquote[dir="rtl"], [dir="rtl"] blockquote {
            direction: rtl !important;
            text-align: right !important;
            border-left: none !important;
            border-right: 4px solid var(--vscode-textBlockQuote-border, #3b82f6) !important;
            padding-left: 0.5rem !important;
            padding-right: 1rem !important;
        }

        /* RTL Tables - Full right-to-left column layout and cell alignment */
        table[dir="rtl"], [dir="rtl"] table,
        .prose table[dir="rtl"], .markdown-body table[dir="rtl"],
        .leading-relaxed table[dir="rtl"], [data-testid="conversation-view"] table[dir="rtl"] {
            direction: rtl !important;
            text-align: right !important;
            border-collapse: collapse !important;
        }

        table[dir="rtl"] thead, [dir="rtl"] table thead,
        table[dir="rtl"] tbody, [dir="rtl"] table tbody,
        table[dir="rtl"] tr, [dir="rtl"] table tr {
            direction: rtl !important;
            text-align: right !important;
        }

        table[dir="rtl"] th, table[dir="rtl"] td,
        [dir="rtl"] table th, [dir="rtl"] table td,
        th[dir="rtl"], td[dir="rtl"] {
            direction: rtl !important;
            text-align: right !important;
        }

        /* Code chips & pre inside RTL table cells */
        table[dir="rtl"] code, [dir="rtl"] table code,
        table[dir="rtl"] pre, [dir="rtl"] table pre,
        th[dir="rtl"] code, td[dir="rtl"] code {
            direction: ltr !important;
            unicode-bidi: isolate !important;
            display: inline-block !important;
        }

        /* File link chips inside RTL sentences: isolate LTR file path */
        a[href^="file://"], a[href^="file:///"] {
            unicode-bidi: isolate !important;
            direction: ltr !important;
        }

        /* Thinking blocks (Keep strictly LTR) */
        .cursor-edit.text-secondary-foreground,
        .cursor-edit.text-secondary-foreground * {
            direction: ltr !important;
            text-align: left !important;
            unicode-bidi: isolate !important;
        }

        /* Code blocks & Monaco Editor (STRICT LTR & Monospace Font) */
        pre, code, pre *, code *,
        .font-mono, .font-mono *,
        textarea.font-mono,
        .monaco-editor, .monaco-editor * {
            unicode-bidi: isolate !important;
            direction: ltr !important;
            text-align: left !important;
            font-family: ${codeFontStr} !important;
        }
    `;
}
