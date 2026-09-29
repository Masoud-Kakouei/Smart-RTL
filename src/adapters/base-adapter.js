/**
 * Smart RTL - Base Adapter
 * Abstract base class for target application adapters.
 */

export class BaseAdapter {
    constructor(name) {
        this.name = name;
    }

    /**
     * Array of CSS selectors for text elements (paragraphs, headings, quotes)
     */
    getMessageSelectors() {
        return [];
    }

    /**
     * Array of CSS selectors for editable input elements
     */
    getInputSelectors() {
        return [];
    }

    /**
     * Array of CSS selectors for lists (ul, ol)
     */
    getListSelectors() {
        return [];
    }

    /**
     * Array of CSS selectors for tables
     */
    getTableSelectors() {
        return ['table'];
    }

    /**
     * Selector for anchoring the toggle widget
     */
    getToggleAnchorSelector() {
        return null;
    }

    /**
     * Position to insert toggle widget relative to anchor:
     * 'before' | 'after' | 'prepend' | 'append'
     */
    getToggleInsertPosition() {
        return 'before';
    }

    /**
     * Checks if element is code/monospace and should be skipped
     */
    shouldSkip(element) {
        if (!element) return true;
        return (
            element.tagName === 'PRE' ||
            element.tagName === 'CODE' ||
            element.classList?.contains('font-mono') ||
            element.closest?.('pre') ||
            element.closest?.('.monaco-editor')
        );
    }

    /**
     * Checks if this adapter is active in current document
     */
    isDetected(doc = document) {
        return false;
    }
}
