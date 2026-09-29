/**
 * Smart RTL - Keyboard Fixes
 * - Shift+2 fix for typing '@' instead of '٬' / '،' in Persian keyboard
 * - Alt+R global shortcut for toggling RTL state
 */

export function setupKeyboardListeners(options = {}) {
    const {
        getFixAtSign = () => true,
        onToggleRTL = () => {}
    } = options;

    // Alt + R Shortcut directly toggles RTL
    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.code === 'KeyR') {
            e.preventDefault();
            onToggleRTL();
        }
    });

    // Shift + 2 Persian @ fix
    document.addEventListener('keydown', (e) => {
        if (!getFixAtSign()) return;
        if (e.code === 'Digit2' && e.shiftKey) {
            if (e.key === '٬' || e.key === '،') {
                e.preventDefault();
                // Modern insertText with fallback
                if (document.queryCommandSupported && document.queryCommandSupported('insertText')) {
                    document.execCommand('insertText', false, '@');
                } else {
                    const activeEl = document.activeElement;
                    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
                        const start = activeEl.selectionStart;
                        const end = activeEl.selectionEnd;
                        activeEl.value = activeEl.value.substring(0, start) + '@' + activeEl.value.substring(end);
                        activeEl.selectionStart = activeEl.selectionEnd = start + 1;
                        activeEl.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }
            }
        }
    }, { capture: true });
}
