/**
 * Smart RTL - VS Code Cline Adapter
 * Dedicated adapter for the Cline (Claude Dev) extension in VS Code.
 */

import { BaseAdapter } from './base-adapter.js';

export class VSCodeClineAdapter extends BaseAdapter {
    constructor() {
        super('vscode-cline');
    }

    getMessageSelectors() {
        return [
            '.cline-messages-container p',
            '.cline-messages-container h1',
            '.cline-messages-container h2',
            '.cline-messages-container h3',
            '.cline-messages-container h4',
            '.cline-messages-container blockquote',
            'div[class*="chat-row"] p',
            'div[class*="message"] p'
        ];
    }

    getInputSelectors() {
        return [
            'textarea[placeholder]',
            'textarea[data-testid="chat-input"]',
            '.cline-input-container textarea',
            'textarea'
        ];
    }

    getListSelectors() {
        return [
            '.cline-messages-container ul',
            '.cline-messages-container ol'
        ];
    }

    getTableSelectors() {
        return [
            '.cline-messages-container table',
            'table'
        ];
    }

    getToggleAnchorSelector() {
        return '.cline-header-buttons, .toolbar-actions, header > div:last-child, .header-actions';
    }

    getToggleInsertPosition() {
        return 'prepend';
    }

    isDetected(doc = document) {
        return Boolean(
            doc.querySelector('.cline-messages-container') ||
            doc.querySelector('[data-testid="cline"]') ||
            doc.title?.toLowerCase().includes('cline') ||
            doc.querySelector('body[data-vscode-theme-kind]') && (
                doc.querySelector('div[class*="cline"]') ||
                doc.querySelector('div[id*="cline"]')
            )
        );
    }
}
