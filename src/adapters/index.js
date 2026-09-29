/**
 * Smart RTL - Adapter Registry & Auto-Detection
 */

import { AntigravityIDEAdapter } from './antigravity-ide.js';
import { AntigravityChatAdapter } from './antigravity-chat.js';
import { VSCodeClineAdapter } from './vscode-cline.js';
import { VSCodeContinueAdapter } from './vscode-continue.js';
import { VSCodeRooCodeAdapter } from './vscode-roocode.js';
import { VSCodeAntigravityAdapter } from './vscode-antigravity.js';
import { GenericWebviewAdapter } from './generic-webview.js';

export {
    AntigravityIDEAdapter,
    AntigravityChatAdapter,
    VSCodeClineAdapter,
    VSCodeContinueAdapter,
    VSCodeRooCodeAdapter,
    VSCodeAntigravityAdapter,
    GenericWebviewAdapter
};

export function detectActiveAdapter(doc = document) {
    const ide = new AntigravityIDEAdapter();
    if (ide.isDetected(doc)) return ide;

    const cline = new VSCodeClineAdapter();
    if (cline.isDetected(doc)) return cline;

    const cont = new VSCodeContinueAdapter();
    if (cont.isDetected(doc)) return cont;

    const roo = new VSCodeRooCodeAdapter();
    if (roo.isDetected(doc)) return roo;

    const vsAg = new VSCodeAntigravityAdapter();
    if (vsAg.isDetected(doc)) return vsAg;

    const chat = new AntigravityChatAdapter();
    if (chat.isDetected(doc)) return chat;

    return new GenericWebviewAdapter();
}
