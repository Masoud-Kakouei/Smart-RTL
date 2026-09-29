/**
 * Smart RTL - Antigravity Desktop Chat App Adapter
 * Adapter for the standalone Antigravity Electron application.
 */

import { BaseAdapter } from './base-adapter.js';

export class AntigravityChatAdapter extends BaseAdapter {
    constructor() {
        super('antigravity-chat');
    }

    getMessageSelectors() {
        return [
            '.prose > p', '.prose > h1', '.prose > h2', '.prose > h3', '.prose > h4', '.prose > h5', '.prose > h6',
            '.leading-relaxed p',
            '[data-testid="chat-message"] p',
            '[data-testid="user-input-step"]'
        ];
    }

    getInputSelectors() {
        return [
            '[contenteditable="true"]',
            'textarea'
        ];
    }

    getListSelectors() {
        return [
            '.prose ul',
            '.prose ol',
            '.leading-relaxed ul',
            '.leading-relaxed ol'
        ];
    }

    getTableSelectors() {
        return ['table'];
    }

    getToggleAnchorSelector() {
        return 'header .actions, .top-bar-actions, [data-testid="header-actions"]';
    }

    getToggleInsertPosition() {
        return 'prepend';
    }

    isDetected(doc = document) {
        return Boolean(
            doc.title?.includes('Antigravity') &&
            !doc.querySelector('.monaco-workbench')
        );
    }
}
