/**
 * Smart RTL - Widget UI Component
 * Builds the Toggle button and settings dropdown with trustedTypes safety.
 */

export function safeCreateElement(htmlString) {
  if (
    typeof window !== "undefined" &&
    window.trustedTypes &&
    window.trustedTypes.createPolicy
  ) {
    try {
      if (!window.__rtlPolicy) {
        window.__rtlPolicy = window.trustedTypes.createPolicy("rtlPolicy", {
          createHTML: (s) => s,
        });
      }
      const wrapper = document.createElement("div");
      wrapper.innerHTML = window.__rtlPolicy.createHTML(htmlString);
      return wrapper.firstElementChild;
    } catch (e) {}
  }
  try {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = htmlString;
    return wrapper.firstElementChild;
  } catch (e) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, "text/html");
      return doc.body.firstElementChild;
    } catch (err) {
      console.error("[Smart RTL] DOM creation error:", err);
      return null;
    }
  }
}

export function injectWidgetStyles(doc = document) {
  if (doc.getElementById("smart-rtl-widget-style")) return;
  const style = doc.createElement("style");
  style.id = "smart-rtl-widget-style";
  style.textContent = `
        /* Enable Titlebar Overflow for Dropdown */
        .monaco-workbench .part.titlebar,
        .monaco-workbench .part.titlebar > .titlebar-container,
        .monaco-workbench .part.titlebar .titlebar-right {
            overflow: visible !important;
        }

        /* Titlebar Alignment - anchor next to layout controls */
        .monaco-workbench .part.titlebar .titlebar-right > .rtl-header-wrap,
        .titlebar-right > .rtl-header-wrap {
            margin-left: auto !important;
        }
        .monaco-workbench .part.titlebar .titlebar-right > .rtl-header-wrap + .action-toolbar-container,
        .titlebar-right > .rtl-header-wrap + .action-toolbar-container {
            margin-left: 0 !important;
        }

        /* RTL Header Button Wrapper */
        .rtl-header-wrap {
            position: relative !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            height: 100% !important;
            margin: 0 4px !important;
            -webkit-app-region: no-drag !important;
            app-region: no-drag !important;
            z-index: 10000 !important;
            user-select: none !important;
        }

        /* RTL Header Button (Harmonized with titlebar & toolbar icons) */
        .rtl-header-button {
            position: relative !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 24px !important;
            height: 24px !important;
            min-width: 24px !important;
            min-height: 24px !important;
            border-radius: 4px !important;
            cursor: pointer !important;
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            color: var(--vscode-titleBar-activeForeground, var(--vscode-icon-foreground, #cccccc)) !important;
            opacity: 0.85 !important;
            -webkit-app-region: no-drag !important;
            app-region: no-drag !important;
            pointer-events: auto !important;
            transition: all 0.15s ease !important;
        }
        .rtl-header-button:hover {
            opacity: 1 !important;
            color: var(--vscode-titleBar-activeForeground, #ffffff) !important;
            background-color: var(--vscode-toolbar-hoverBackground, rgba(90, 93, 94, 0.31)) !important;
        }
        .rtl-header-button.rtl-active {
            opacity: 1 !important;
            background-color: var(--vscode-button-background, #007acc) !important;
            color: #ffffff !important;
            box-shadow: 0 0 6px rgba(0, 122, 204, 0.4) !important;
        }
        .rtl-header-button.rtl-active:hover {
            background-color: var(--vscode-button-hoverBackground, #0062a3) !important;
            color: #ffffff !important;
        }
        .rtl-header-button svg {
            width: 15px !important;
            height: 15px !important;
            stroke: currentColor !important;
            fill: none !important;
        }

        /* Status Indicator Dot */
        .rtl-status-dot {
            display: none !important;
        }

        /* Settings Dropdown Panel (Fixed to float safely over titlebar and editors) */
        .rtl-dropdown-panel {
            position: fixed !important;
            width: 260px !important;
            background-color: var(--vscode-menu-background, var(--vscode-sideBar-background, #18181b)) !important;
            color: var(--vscode-foreground, #f4f4f5) !important;
            border: 1px solid var(--vscode-widget-border, #3f3f46) !important;
            border-radius: 12px !important;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5) !important;
            padding: 12px 14px !important;
            box-sizing: border-box !important;
            transform: scale(0.95) translateY(-4px) !important;
            opacity: 0 !important;
            pointer-events: none !important;
            transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s ease !important;
            transform-origin: top right !important;
            font-size: 12px !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 7px !important;
            z-index: 2147483647 !important;
            -webkit-app-region: no-drag !important;
            app-region: no-drag !important;
        }
        .rtl-dropdown-panel.rtl-open {
            transform: scale(1) translateY(0) !important;
            opacity: 1 !important;
            pointer-events: auto !important;
        }

        /* Panel Header */
        .rtl-panel-header {
            text-align: center !important;
            font-weight: 600 !important;
            font-size: 13px !important;
            padding-bottom: 6px !important;
            border-bottom: 1px solid var(--vscode-widget-border, #3f3f46) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 6px !important;
        }

        /* Form Rows */
        .rtl-row {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 8px !important;
            margin: 2px 0 !important;
        }
        .rtl-label {
            font-weight: 500 !important;
            font-size: 11px !important;
            opacity: 0.85 !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 4px !important;
        }
        .rtl-separator {
            height: 1px !important;
            background-color: var(--vscode-widget-border, #3f3f46) !important;
            opacity: 0.4 !important;
            margin: 2px 0 !important;
        }

        /* Toggle Switch */
        .rtl-switch {
            position: relative !important;
            display: inline-flex !important;
            align-items: center !important;
            width: 36px !important;
            height: 19px !important;
            background-color: #4b5563 !important;
            border-radius: 9999px !important;
            cursor: pointer !important;
            transition: background-color 0.2s ease !important;
            border: none !important;
            padding: 0 !important;
            flex-shrink: 0 !important;
            outline: none !important;
        }
        .rtl-switch.rtl-on {
            background-color: var(--vscode-button-background, #3b82f6) !important;
        }
        .rtl-switch-knob {
            position: absolute !important;
            width: 13px !important;
            height: 13px !important;
            background-color: #ffffff !important;
            border-radius: 50% !important;
            left: 3px !important;
            transition: transform 0.2s ease !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.4) !important;
        }
        .rtl-switch.rtl-on .rtl-switch-knob {
            transform: translateX(17px) !important;
        }

        /* Text Inputs */
        .rtl-input {
            background-color: var(--vscode-input-background, #27272a) !important;
            color: var(--vscode-input-foreground, #f4f4f5) !important;
            border: 1px solid var(--vscode-input-border, #3f3f46) !important;
            border-radius: 6px !important;
            padding: 3px 6px !important;
            font-size: 11px !important;
            width: 110px !important;
            box-sizing: border-box !important;
            outline: none !important;
            transition: border-color 0.2s !important;
        }
        .rtl-input:focus {
            border-color: var(--vscode-focusBorder, #3b82f6) !important;
        }

        /* Sliders */
        .rtl-slider-wrap {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
        }
        .rtl-slider {
            width: 75px !important;
            height: 4px !important;
            cursor: pointer !important;
            accent-color: var(--vscode-button-background, #3b82f6) !important;
        }
        .rtl-icon-btn {
            background: none !important;
            border: none !important;
            color: var(--vscode-foreground, #a1a1aa) !important;
            opacity: 0.6 !important;
            cursor: pointer !important;
            padding: 0 !important;
            display: inline-flex !important;
            align-items: center !important;
            transition: opacity 0.2s !important;
        }
        .rtl-icon-btn:hover {
            opacity: 1 !important;
        }

        /* Tooltip */
        .rtl-info {
            position: relative !important;
            display: inline-flex !important;
            cursor: help !important;
        }
        .rtl-tooltip {
            visibility: hidden !important;
            opacity: 0 !important;
            position: absolute !important;
            bottom: 120% !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            background-color: #18181b !important;
            color: #f4f4f5 !important;
            border: 1px solid #3f3f46 !important;
            padding: 5px 8px !important;
            border-radius: 6px !important;
            font-size: 10px !important;
            line-height: 1.3 !important;
            white-space: normal !important;
            width: 170px !important;
            text-align: center !important;
            z-index: 100000000 !important;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5) !important;
            pointer-events: none !important;
            transition: opacity 0.2s ease !important;
        }
        .rtl-info:hover .rtl-tooltip {
            visibility: visible !important;
            opacity: 1 !important;
        }

        /* GitHub Star Link */
        .rtl-github {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 5px !important;
            color: var(--vscode-foreground, #a1a1aa) !important;
            text-decoration: none !important;
            font-size: 11px !important;
            padding-top: 3px !important;
            opacity: 0.75 !important;
            transition: opacity 0.2s, color 0.2s !important;
        }
        .rtl-github:hover {
            opacity: 1 !important;
            color: #f59e0b !important;
        }

        /* Floating Fallback Style (When no header anchor is present) */
        .rtl-header-wrap.rtl-floating {
            position: fixed !important;
            bottom: 16px !important;
            right: 16px !important;
            z-index: 999999 !important;
            background-color: var(--vscode-menu-background, #18181b) !important;
            border: 1px solid var(--vscode-widget-border, #3f3f46) !important;
            border-radius: 8px !important;
            padding: 4px !important;
            box-shadow: 0 4px 14px rgba(0,0,0,0.4) !important;
        }
        .rtl-header-wrap.rtl-floating .rtl-dropdown-panel {
            top: auto !important;
            bottom: calc(100% + 8px) !important;
            transform-origin: bottom right !important;
        }
    `;
  doc.head.appendChild(style);
}

export function buildWidgetElement(config, callbacks = {}) {
  const {
    onToggleRTL = () => {},
    onToggleForce = () => {},
    onToggleAtSign = () => {},
    onConfigChange = () => {},
  } = callbacks;

  const html = `
        <div id="smart-rtl-wrap" class="rtl-header-wrap">
          <!-- Toolbar Action Button -->
          <button id="smart-rtl-btn" 
                  type="button" 
                  class="rtl-header-button ${config.isRTL ? "rtl-active" : ""}" 
                  title="Smart RTL (Alt+R)" 
                  aria-label="Smart RTL">
            <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M2 12h20"></path>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <span class="rtl-status-dot"></span>
          </button>

          <!-- Dropdown Settings Panel -->
          <div id="smart-rtl-panel" class="rtl-dropdown-panel">
            <div class="rtl-panel-header">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              <span>Smart RTL</span>
            </div>

            <!-- Toggle RTL -->
            <div class="rtl-row">
              <span class="rtl-label">
                <span id="rtl-toggle-label">${config.isRTL ? "Enabled" : "Disabled"}</span>
                <span class="rtl-info">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                  <span class="rtl-tooltip">Shortcut: Alt + R</span>
                </span>
              </span>
              <button id="rtl-toggle-btn" type="button" class="rtl-switch ${config.isRTL ? "rtl-on" : ""}">
                <span class="rtl-switch-knob"></span>
              </button>
            </div>

            <!-- Force RTL -->
            <div class="rtl-row">
              <span class="rtl-label">
                <span>Force RTL</span>
                <span class="rtl-info">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                  <span class="rtl-tooltip">Forces all text blocks to RTL even if starting with English words</span>
                </span>
              </span>
              <button id="rtl-force-btn" type="button" class="rtl-switch ${config.forceRTL ? "rtl-on" : ""}">
                <span class="rtl-switch-knob"></span>
              </button>
            </div>

            <div class="rtl-separator"></div>

            <!-- Persian Font -->
            <div class="rtl-row">
              <span class="rtl-label" title="Persian Font (Default: Vazirmatn)">FA Font</span>
              <input id="rtl-fafont-input" type="text" class="rtl-input" placeholder="Default: Vazirmatn" value="${config.faFont || ""}">
            </div>

            <!-- English Font -->
            <div class="rtl-row">
              <span class="rtl-label" title="English Font">EN Font</span>
              <input id="rtl-enfont-input" type="text" class="rtl-input" placeholder="Default: System" value="${config.enFont || ""}">
            </div>

            <!-- Code Font -->
            <div class="rtl-row">
              <span class="rtl-label" title="Code Monospace Font">Code Font</span>
              <input id="rtl-codefont-input" type="text" class="rtl-input" placeholder="Default: Monospace" value="${config.codeFont || ""}">
            </div>

            <!-- Line Height -->
            <div class="rtl-row">
              <span class="rtl-label">Line Height</span>
              <div class="rtl-slider-wrap">
                <input id="rtl-lh-input" type="range" min="1.2" max="2.5" step="0.1" value="${config.lh || "1.6"}" class="rtl-slider">
                <button id="rtl-lh-reset" type="button" class="rtl-icon-btn" title="Reset to 1.6">↺</button>
              </div>
            </div>

            <!-- Font Size -->
            <div class="rtl-row">
              <span class="rtl-label">Font Size</span>
              <div class="rtl-slider-wrap">
                <input id="rtl-fs-input" type="range" min="11" max="22" step="1" value="${config.fs || "16"}" class="rtl-slider">
                <button id="rtl-fs-reset" type="button" class="rtl-icon-btn" title="Reset to 16px">↺</button>
              </div>
            </div>

            <div class="rtl-separator"></div>

            <!-- Shift+2 Fix -->
            <div class="rtl-row">
              <span class="rtl-label">
                <span>Shift+2 for @</span>
                <span class="rtl-info">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                  <span class="rtl-tooltip">Types '@' instead of '٬' when using Persian keyboard</span>
                </span>
              </span>
              <button id="rtl-at-btn" type="button" class="rtl-switch ${config.fixAtSign !== false ? "rtl-on" : ""}">
                <span class="rtl-switch-knob"></span>
              </button>
            </div>

            <div class="rtl-separator"></div>

            <!-- GitHub -->
            <a href="https://github.com/Masoud-Kakouei/Smart-RTL" target="_blank" class="rtl-github">
              <svg height="13" width="13" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
              <span>Star on GitHub</span>
            </a>
          </div>
        </div>
    `;

  const wrapper = safeCreateElement(html);
  if (!wrapper) return null;

  const btn = wrapper.querySelector("#smart-rtl-btn");
  const panel = wrapper.querySelector("#smart-rtl-panel");
  const toggleBtn = wrapper.querySelector("#rtl-toggle-btn");
  const toggleLabel = wrapper.querySelector("#rtl-toggle-label");
  const forceBtn = wrapper.querySelector("#rtl-force-btn");
  const atBtn = wrapper.querySelector("#rtl-at-btn");
  const faFontInput = wrapper.querySelector("#rtl-fafont-input");
  const enFontInput = wrapper.querySelector("#rtl-enfont-input");
  const codeFontInput = wrapper.querySelector("#rtl-codefont-input");
  const lhInput = wrapper.querySelector("#rtl-lh-input");
  const lhResetBtn = wrapper.querySelector("#rtl-lh-reset");
  const fsInput = wrapper.querySelector("#rtl-fs-input");
  const fsResetBtn = wrapper.querySelector("#rtl-fs-reset");

  const updatePanelPosition = () => {
    if (!panel || !btn) return;
    const rect = btn.getBoundingClientRect();
    panel.style.top = Math.round(rect.bottom + 4) + "px";
    panel.style.right = Math.max(8, Math.round(window.innerWidth - rect.right)) + "px";
    panel.style.left = "auto";
  };

  // Toggle panel visibility
  btn?.addEventListener("click", (e) => {
    e.stopPropagation();
    updatePanelPosition();
    panel?.classList.toggle("rtl-open");
  });

  window.addEventListener("resize", () => {
    if (panel?.classList.contains("rtl-open")) {
      updatePanelPosition();
    }
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (panel?.classList.contains("rtl-open") && !wrapper.contains(e.target)) {
      panel.classList.remove("rtl-open");
    }
  });

  // Toggle RTL
  toggleBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    onToggleRTL();
  });

  // Force RTL
  forceBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    onToggleForce();
  });

  // At Sign
  atBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    onToggleAtSign();
  });

  // Inputs change
  const triggerConfigUpdate = () => {
    onConfigChange({
      faFont: faFontInput?.value.trim() || "",
      enFont: enFontInput?.value.trim() || "",
      codeFont: codeFontInput?.value.trim() || "",
      lh: lhInput?.value || "1.6",
      fs: fsInput?.value || "16",
    });
  };

  [faFontInput, enFontInput, codeFontInput].forEach((inp) => {
    inp?.addEventListener("input", triggerConfigUpdate);
  });

  lhInput?.addEventListener("input", triggerConfigUpdate);
  lhResetBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (lhInput) lhInput.value = "1.6";
    triggerConfigUpdate();
  });

  fsInput?.addEventListener("input", triggerConfigUpdate);
  fsResetBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (fsInput) fsInput.value = "16";
    triggerConfigUpdate();
  });

  return wrapper;
}
