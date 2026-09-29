/**
 * Smart RTL - VS Code Roo Code Adapter
 * Dedicated adapter for the Roo Code (Roo Cline) extension in VS Code.
 */

import { BaseAdapter } from './base-adapter.js';

export class VSCodeRooCodeAdapter extends BaseAdapter {
    constructor() {
        super('vscode-roocode');
    }

    getMessageSelectors() {
        return [
            '.roo-cline-messages p',
            '.roo-cline-messages h1',
            '.roo-cline-messages h2',
            '.roo-cline-messages h3',
            '.roo-cline-messages blockquote',
            '[data-roo] p',
            'div[class*="roo"] p'
        ];
    }

    getInputSelectors() {
        return [
            'textarea[placeholder]',
            'textarea',
            '[contenteditable="true"]'
        ];
    }

    getListSelectors() {
        return [
            '.roo-cline-messages ul',
            '.roo-cline-messages ol'
        ];
    }

    getTableSelectors() {
        return [
            '.roo-cline-messages table',
            'table'
        ];
    }

    getToggleAnchorSelector() {
        return '.roo-header-actions, .toolbar-actions, header > div:last-child';
    }

    getToggleInsertPosition() {
        return 'prepend';
    }

    isDetected(doc = document) {
        return Boolean(
            doc.querySelector('.roo-cline-messages') ||
            doc.querySelector('[data-roo]') ||
            doc.title?.toLowerCase().includes('roo')
        );
    }
}
