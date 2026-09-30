/**
 * Smart RTL - Widget Anchor
 * Intelligent 3-stage anchoring system that guarantees the toggle button
 * is always accessible and placed in the right toolbar regardless of layout changes.
 */

export class WidgetAnchor {
    constructor(adapter, widgetWrapper) {
        this.adapter = adapter;
        this.widget = widgetWrapper;
        this.currentLocation = null; // 'header' | 'actionbar' | 'floating'
    }

    /**
     * Stage 1: VS Code & Antigravity IDE Title Bar (Top right beside layout controls)
     * Stage 2: Adapter-specific header toolbar anchor
     * Stage 3: Generic VS Code / Electron action bar
     * Stage 4: Fixed floating button in bottom-right corner
     */
    attach() {
        if (!this.widget) return;

        // Stage 1: Try Title Bar (Top of IDE beside Layout Controls)
        const titlebarAnchor = this._findTitleBarAnchor();
        if (titlebarAnchor) {
            this._insertNearTitlebar(titlebarAnchor);
            return;
        }

        // Stage 2: Try adapter-specific anchor
        const primarySelector = this.adapter?.getToggleAnchorSelector();
        if (primarySelector) {
            const anchor = document.querySelector(primarySelector);
            if (anchor && anchor.parentElement) {
                this._insertNear(anchor);
                return;
            }
        }

        // Stage 3: Try universal VS Code action bars
        const actionBar = this._findActionBar();
        if (actionBar) {
            this._insertInto(actionBar);
            return;
        }

        // Check if inside iframe/webview: do not float over content
        const isInsideIframe = () => {
            try { return window.self !== window.top; } catch(e) { return true; }
        };
        if (isInsideIframe()) {
            return;
        }

        // Stage 4: Floating corner fallback (only for standalone top-level windows)
        this._floatInCorner();
    }

    _findTitleBarAnchor() {
        const titlebarRight = document.querySelector(
            '.part.titlebar .titlebar-right, #workbench\\.parts\\.titlebar .titlebar-right, .titlebar-container .titlebar-right, .titlebar-right'
        );
        if (!titlebarRight) return null;

        // Position immediately before layout controls (.action-toolbar-container)
        const actionToolbar = titlebarRight.querySelector('.action-toolbar-container');
        if (actionToolbar) {
            return { container: actionToolbar, isInsideActionToolbar: true };
        }

        // Fallback: Position before window controls (minimize/maximize/close)
        const windowControls = titlebarRight.querySelector('.window-controls-container');
        if (windowControls) {
            return { container: titlebarRight, before: windowControls };
        }

        return { container: titlebarRight, before: null };
    }

    _insertNearTitlebar(anchorInfo) {
        const { container, before, isInsideActionToolbar } = anchorInfo;
        if (!container) return;

        if (isInsideActionToolbar) {
            if (this.widget.parentElement === container && container.firstElementChild === this.widget) {
                this.currentLocation = 'titlebar';
                this.widget.classList.remove('rtl-floating');
                return;
            }
            this.widget.classList.remove('rtl-floating');
            container.prepend(this.widget);
            this.currentLocation = 'titlebar';
            return;
        }

        if (before) {
            if (this.widget.parentElement === container && this.widget.nextElementSibling === before) {
                this.currentLocation = 'titlebar';
                this.widget.classList.remove('rtl-floating');
                return;
            }
            this.widget.classList.remove('rtl-floating');
            container.insertBefore(this.widget, before);
        } else {
            if (this.widget.parentElement === container && container.lastElementChild === this.widget) {
                this.currentLocation = 'titlebar';
                this.widget.classList.remove('rtl-floating');
                return;
            }
            this.widget.classList.remove('rtl-floating');
            container.appendChild(this.widget);
        }
        this.currentLocation = 'titlebar';
    }

    _findActionBar() {
        const candidates = [
            '.composite.title .title-actions',
            '.pane-header .actions',
            '.editor-group-container .title .tabs-and-actions-container .editor-actions',
            '.webview-header .action-bar',
            '.toolbar-actions',
            '.action-bar',
            'header .actions',
            '.header-actions'
        ];

        for (const sel of candidates) {
            const el = document.querySelector(sel);
            if (el && el.parentElement) return el;
        }
        return null;
    }

    _insertNear(anchor) {
        const pos = this.adapter?.getToggleInsertPosition() || 'before';
        const parent = anchor.parentElement;
        if (!parent) return;

        // If already in place, avoid unnecessary DOM operations
        if (pos === 'before' && this.widget.parentElement === parent && this.widget.nextElementSibling === anchor) {
            this.currentLocation = 'header';
            this.widget.classList.remove('rtl-floating');
            return;
        }

        this.widget.classList.remove('rtl-floating');
        if (pos === 'before') {
            parent.insertBefore(this.widget, anchor);
        } else if (pos === 'after') {
            anchor.after(this.widget);
        } else if (pos === 'prepend') {
            anchor.prepend(this.widget);
        } else {
            anchor.appendChild(this.widget);
        }
        this.currentLocation = 'header';
    }

    _insertInto(container) {
        if (this.widget.parentElement === container) {
            this.currentLocation = 'actionbar';
            this.widget.classList.remove('rtl-floating');
            return;
        }

        this.widget.classList.remove('rtl-floating');
        container.prepend(this.widget);
        this.currentLocation = 'actionbar';
    }

    _floatInCorner() {
        if (this.currentLocation === 'floating' && document.body.contains(this.widget)) {
            return;
        }

        this.widget.classList.add('rtl-floating');
        document.body.appendChild(this.widget);
        this.currentLocation = 'floating';
    }

    /**
     * Checks if widget is properly attached in DOM.
     * Also checks if a higher-priority anchor has appeared (e.g. after view load).
     */
    ensureAttached() {
        if (!this.widget) return;

        // If not in DOM, reattach
        if (!this.widget.parentElement || !document.body.contains(this.widget)) {
            this.attach();
            return;
        }

        // If not attached to Title Bar, check if Title Bar has appeared
        if (this.currentLocation !== 'titlebar') {
            const titlebar = this._findTitleBarAnchor();
            if (titlebar) {
                this.attach();
                return;
            }
        }

        // If currently floating, check if a header or action bar has appeared
        if (this.currentLocation === 'floating') {
            const primarySelector = this.adapter?.getToggleAnchorSelector();
            if (primarySelector && document.querySelector(primarySelector)) {
                this.attach();
            } else if (this._findActionBar()) {
                this.attach();
            }
        }
    }
}
