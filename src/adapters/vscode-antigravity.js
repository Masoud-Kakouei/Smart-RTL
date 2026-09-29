/**
 * Smart RTL - VS Code Antigravity Extension Adapter
 * Dedicated adapter for the Antigravity extension when running inside VS Code.
 */

import { BaseAdapter } from './base-adapter.js';

export class VSCodeAntigravityAdapter extends BaseAdapter {
    constructor() {
        super('vscode-antigravity');
    }

    getMessageSelectors() {
        return [
            '[data-testid="conversation-view"] p',
            '[data-testid="conversation-view"] h1',
            '[data-testid="conversation-view"] h2',
            '[data-testid="conversation-view"] h3',
            '[data-testid="conversation-view"] blockquote',
            '[data-testid="chat-message"] p',
            '[data-testid="user-input-step"]',
            '.prose p',
            '.leading-relaxed p'
        ];
    }

    getInputSelectors() {
        return [
            '[contenteditable="true"] p',
            '[contenteditable="true"]',
            'textarea'
        ];
    }

    getListSelectors() {
        return [
            '[data-testid="conversation-view"] ul',
            '[data-testid="conversation-view"] ol',
            '.prose ul',
            '.prose ol'
        ];
    }

    getTableSelectors() {
        return ['table'];
    }

    getToggleAnchorSelector() {
        return '[data-tooltip-id="new-conversation-tooltip"], [data-past-conversations-toggle="true"], .toolbar-actions';
    }

    getToggleInsertPosition() {
        return 'before';
    }

    isDetected(doc = document) {
        return Boolean(
            doc.querySelector('[data-testid="conversation-view"]') ||
            doc.querySelector('[data-tooltip-id="new-conversation-tooltip"]')
        );
    }
}
