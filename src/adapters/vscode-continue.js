/**
 * Smart RTL - VS Code Continue Adapter
 * Dedicated adapter for the Continue extension in VS Code.
 */

import { BaseAdapter } from './base-adapter.js';

export class VSCodeContinueAdapter extends BaseAdapter {
    constructor() {
        super('vscode-continue');
    }

    getMessageSelectors() {
        return [
            '.continue-chat p',
            '.continue-chat h1',
            '.continue-chat h2',
            '.continue-chat h3',
            '.continue-chat blockquote',
            '[data-continue] p',
            '.thread-message p'
        ];
    }

    getInputSelectors() {
        return [
            'textarea.continue-input',
            '.tiptap',
            '[contenteditable="true"]',
            'textarea'
        ];
    }

    getListSelectors() {
        return [
            '.continue-chat ul',
            '.continue-chat ol'
        ];
    }

    getTableSelectors() {
        return [
            '.continue-chat table',
            'table'
        ];
    }

    getToggleAnchorSelector() {
        return '.continue-header-actions, .continue-chat-header, header .actions';
    }

    getToggleInsertPosition() {
        return 'prepend';
    }

    isDetected(doc = document) {
        return Boolean(
            doc.querySelector('.continue-chat') ||
            doc.querySelector('[data-continue]') ||
            doc.title?.toLowerCase().includes('continue')
        );
    }
}
