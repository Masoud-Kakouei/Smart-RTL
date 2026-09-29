/**
 * Smart RTL - Generic Webview Adapter
 * Universal fallback adapter that matches standard markdown, chat, and input elements
 * in any webview or Electron window.
 */

import { BaseAdapter } from './base-adapter.js';

export class GenericWebviewAdapter extends BaseAdapter {
    constructor() {
        super('generic-webview');
    }

    getMessageSelectors() {
        return [
            'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote',
            '.prose p', '.markdown-body p', '.message p', '.chat-message p'
        ];
    }

    getInputSelectors() {
        return [
            '[contenteditable="true"]',
            'textarea',
            'input[type="text"]'
        ];
    }

    getListSelectors() {
        return ['ul', 'ol'];
    }

    getTableSelectors() {
        return ['table'];
    }

    getToggleAnchorSelector() {
        return '.composite.title .title-actions, .pane-header .actions, header .actions, .action-bar';
    }

    getToggleInsertPosition() {
        return 'prepend';
    }

    isDetected() {
        return true; // Always matches as fallback
    }
}
