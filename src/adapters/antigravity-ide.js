/**
 * Smart RTL - Antigravity IDE Adapter
 * Dedicated adapter for Antigravity IDE workbench, chat panel,
 * walkthrough, task list, implementation plan, and interactive prompts.
 */

import { BaseAdapter } from './base-adapter.js';

export class AntigravityIDEAdapter extends BaseAdapter {
    constructor() {
        super('antigravity-ide');
    }

    getMessageSelectors() {
        return [
            '.prose > p', '.prose > h1', '.prose > h2', '.prose > h3', '.prose > h4', '.prose > h5', '.prose > h6', '.prose > blockquote',
            '.leading-relaxed p', '.leading-relaxed h1', '.leading-relaxed h2', '.leading-relaxed h3', '.leading-relaxed h4', '.leading-relaxed h5', '.leading-relaxed h6', '.leading-relaxed blockquote',
            '[data-testid="conversation-view"] p',
            '[data-testid="conversation-view"] h1',
            '[data-testid="conversation-view"] h2',
            '[data-testid="conversation-view"] h3',
            '[data-testid="conversation-view"] h4',
            '[data-testid="conversation-view"] blockquote',
            '[data-testid="chat-message"] p',
            '[data-testid="chat-message"] h1',
            '[data-testid="chat-message"] h2',
            '[data-testid="chat-message"] h3',
            '[data-testid="user-input-step"]',
            '[data-testid="user-input-step"] > *',
            'label[for^="ask-opt-"]'
        ];
    }

    getInputSelectors() {
        return [
            '[contenteditable="true"] p',
            '[contenteditable="true"]',
            'textarea[data-testid="ask-question-writein"]',
            'textarea'
        ];
    }

    getListSelectors() {
        return [
            '[data-testid="conversation-view"] ul',
            '[data-testid="conversation-view"] ol',
            '.leading-relaxed ul',
            '.leading-relaxed ol',
            '.prose ul',
            '.prose ol',
            '[data-testid="chat-message"] ul',
            '[data-testid="chat-message"] ol'
        ];
    }

    getTableSelectors() {
        return [
            'table',
            '[data-testid="conversation-view"] table',
            '.prose table',
            '.markdown-body table'
        ];
    }

    getToggleAnchorSelector() {
        return '[data-tooltip-id="new-conversation-tooltip"], [data-past-conversations-toggle="true"]';
    }

    getToggleInsertPosition() {
        return 'before';
    }

    isDetected(doc = document) {
        return Boolean(
            doc.querySelector('[data-testid="conversation-view"]') ||
            doc.querySelector('.antigravity-statusbar-settings-panel') ||
            doc.querySelector('[data-tooltip-id="new-conversation-tooltip"]') ||
            doc.querySelector('[data-past-conversations-toggle="true"]') ||
            doc.querySelector('.monaco-workbench')
        );
    }
}
