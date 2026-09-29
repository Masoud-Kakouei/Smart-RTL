# 🌐 Smart RTL

> **موتور هوشمند راست‌چین‌سازی (RTL) و پشتیبانی زبان فارسی برای Antigravity IDE، VS Code (Cline, Continue, Roo Code) و اپلیکیشن‌های مبتنی بر Electron**  
> *A smart Right-to-Left (BiDi) engine & Persian/Arabic typography patcher for Antigravity IDE, Visual Studio Code (Cline, Continue, Roo Code), and Electron applications.*

---

[فارسی](#-راهنمای-فارسی) • [English](#-english-documentation)

---

## 🇮🇷 راهنمای فارسی

پروژه **Smart RTL** یک ابزار مستقل، مدرن و ماژولار است که مشکل به‌هم‌ریختگی متن‌های فارسی و عربی، فونت‌های نامناسب، جهت‌گیری غلط لیست‌ها و جداول، و باگ‌های چینش جملات دوزبانه (فارسی-انگلیسی) را در محیط‌های کدنویسی و دستیارهای هوش مصنوعی برطرف می‌کند.

### ✨ امکانات و قابلیت‌ها

- 🎯 **تشخیص هوشمند جهت (Smart Direction Engine):** بر خلاف ابزارهای سنتی که فقط اولین حرف را بررسی می‌کردند، جملاتی که با کلمات انگلیسی شروع می‌شوند (مانند `car رو برای تست نوشتم`) کاملاً درست و راست‌چین رندر می‌شوند.
- 🧩 **سیستم جایگذاری ۳ مرحله‌ای دکمه تنظیمات (Adaptive Smart Toggle):**
  - **مرحله ۱:** اتصال خودکار به نوار ابزار اصلی (Toolbar) در کنار دکمه‌های پنل.
  - **مرحله ۲:** اتصال به نوار اکشن‌های عمومی ادیتور در صورت جابجایی پنل چت توسط کاربر.
  - **مرحله ۳:** شناور شدن خودکار در گوشه تصویر در صورت بسته بودن یا نبود نوار ابزار، تا دکمه هرگز گم نشود!
- 🎨 **پشتیبانی کامل از فونت وزیرمتن (Vazirmatn Variable Font):** لود مستقیم فونت با فرمت بهینه woff2 بدون افت سرعت.
- 🔤 **فونت و سایز سفارشی:** قابلیت انتخاب فونت فارسی، انگلیسی، فونت کد، ارتفاع خط (Line Height) و اندازه قلم در پنل تنظیمات.
- 🛡️ **حفظ کامل کدها و آیکون‌ها:** عدم تأثیرگذاری روی بلوک‌های کد (`pre`, `code`)، ادیتور Monaco و آیکون‌های Codicon.
- ⌨️ **اصلاح هوشمند کیبورد فارسی:** رفع باگ کلید Shift+2 در کیبورد فارسی جهت تایپ علامت `@` به جای `٬` یا `،` برای تگ کردن دستیارها و ابزارها.
- ⌨️ **کلید میانبر Alt + R:** فعال یا غیرفعال‌سازی سریع حالت RTL با فشردن کلیدهای `Alt + R`.
- 🛡️ **محاسبه خودکار Checksum:** ادیتور هرگز خطای "نصب برنامه خراب است" (Corrupt installation) نشان نخواهد داد.

---

### 💻 محیط‌ها و افزونه‌های پشتیبانی‌شده

| ادیتور / افزونه | وضعیت | قابلیت‌ها |
|-----------------|-------|-----------|
| **Antigravity IDE** | پشتیبانی کامل ✅ | پنل چت، تسک‌ها، Implementation Plan، Walkthrough |
| **VS Code + Cline** | پشتیبانی کامل ✅ | پیام‌های ارسالی و دریافتی، فرم‌های ورودی، نوار ابزار |
| **VS Code + Continue** | پشتیبانی کامل ✅ | چت، لیست فایل‌ها، ورودی پرامپت |
| **VS Code + Roo Code** | پشتیبانی کامل ✅ | پنل گفتگوی هوش مصنوعی و لیست تاریخچه |
| **VS Code + Antigravity** | پشتیبانی کامل ✅ | افزونه آنتی‌گرویتی در VS Code |
| **Antigravity Desktop App** | پشتیبانی کامل ✅ | اپلیکیشن دسکتاپ مستقل |

---

### 🚀 نحوه نصب و استفاده

#### روش اول: نصب سریع با npx (بدون نیاز به دانلود فایل)

ترمینال خود (PowerShell، CMD یا Bash) را باز کنید و دستور زیر را اجرا نمایید:

```bash
npx smart-rtl
```

منوی تعاملی باز شده و برنامه‌های نصب‌شده در سیستم شما را به طور خودکار شناسایی می‌کند. کافیست با کلیدهای جهت‌نما برنامه مورد نظر خود را انتخاب کنید.

#### روش دوم: پچ کردن مستقیم یک برنامه خاص

```bash
# پچ کردن Antigravity IDE
npx smart-rtl --target antigravity-ide

# پچ کردن VS Code (برای تمام افزونه‌های Cline, Continue, Roo Code)
npx smart-rtl --target vscode

# پچ کردن تمام برنامه‌های شناسایی‌شده با هم
npx smart-rtl --target all
```

#### روش سوم: بررسی وضعیت پچ‌ها

برای بررسی این که چه برنامه‌هایی پچ شده‌اند و آیا بکاپ وجود دارد:

```bash
npx smart-rtl --status
```

#### روش چهارم: بازگردانی به حالت اولیه (Uninstall / Restore)

در هر زمان که بخواهید تغییرات به طور کامل به حالت اولیه بازمی‌گردد:

```bash
npx smart-rtl --restore
```

> **نکته برای کاربران ویندوز:** در صورتی که برنامه در مسیری نصب شده باشد که نیاز به دسترسی Administrator دارد، ترمینال (PowerShell یا Command Prompt) را به صورت **Run as Administrator** باز کنید.

---

### ⚙️ پنل تنظیمات داخل ادیتور

پس از نصب و باز کردن ادیتور، یک آیکون کره زمین (🌐) در نوار ابزار یا گوشه پنجره نمایان می‌شود:
- با **کلیک روی آیکون**، پنل تنظیمات باز می‌شود.
- **Enabled / Disabled:** روشن یا خاموش کردن موتور RTL (یا فشردن Alt+R).
- **Force RTL:** راست‌چین کردن اجباری همه بلوک‌های متنی.
- **FA Font:** نام فونت فارسی دلخواه (مثلاً `IRANSansX`، `Shabnam`، یا پیش‌فرض `Vazirmatn`).
- **EN Font:** فونت انگلیسی دلخواه.
- **Code Font:** فونت کد و مونو اسپیس دلخواه (مثلاً `Fira Code`، `JetBrains Mono`).
- **Line Height / Font Size:** تنظیم فاصله خطوط و اندازه متن با اسلایدر و دکمه بازنشانی (↺).
- **Shift+2 for @:** فعال یا غیرفعال‌سازی تبدیل کاراکتر در کیبورد فارسی.

---

<br>

## 🇬🇧 English Documentation

**Smart RTL** is a modular, high-performance Right-to-Left (BiDi) text enhancer and typography patcher engineered for VS Code-based IDEs and Electron applications, with dedicated adapters for AI coding assistants such as **Cline**, **Continue**, **Roo Code**, and **Antigravity**.

### 🌟 Key Features

1. **Intelligent Direction Engine:** Resolves mixed-language issues where Persian/Arabic sentences starting with English terms (e.g. `API رو بررسی کن`) would mistakenly render as LTR.
2. **Adaptive 3-Tier Widget Anchoring:**
   - **Tier 1:** Anchors seamlessly to extension headers or toolbar action buttons.
   - **Tier 2:** Falls back to generic title action bars if panel layout changes.
   - **Tier 3:** Gracefully floats in the corner if no toolbar exists, ensuring settings are never inaccessible.
3. **Embedded High-Quality Fonts:** Integrates Google's Vazirmatn Variable font with optimal weight mappings.
4. **Non-destructive Code Handling:** Strict monospace and LTR preservation for code blocks, Monaco editors, and Codicon icon fonts.
5. **Checksum Auto-Healing:** Recalculates `product.json` SHA-256 hashes to prevent "Installation is corrupt" warnings.
6. **Zero-Latency Traversal:** Built with native `TreeWalker` and `requestAnimationFrame` debouncing, eliminating heavy periodic intervals.

---

### 🛠️ Installation & CLI Usage

Run via `npx`:

```bash
# Interactive menu (Auto-detects IDEs and installed extensions)
npx smart-rtl

# Directly patch Antigravity IDE
npx smart-rtl --target antigravity-ide

# Directly patch VS Code (Supports Cline, Continue, Roo Code)
npx smart-rtl --target vscode

# Patch all detected targets
npx smart-rtl --target all

# Check status of installations
npx smart-rtl --status

# Restore unpatched originals
npx smart-rtl --restore
```

---

### 📁 Project Architecture

```
smart-rtl/
├── bin/
│   └── cli.js                  # Interactive CLI entrypoint
├── fonts/
│   └── Vazirmatn-Variable.woff2# Embedded font
├── src/
│   ├── core/
│   │   ├── direction-engine.js # BiDi analysis with TreeWalker
│   │   ├── bidi-css.js         # Typography & layout stylesheet generator
│   │   ├── font-loader.js      # FontFace binary loader
│   │   ├── config-manager.js   # Local storage config & migrations
│   │   ├── widget-ui.js        # Accessible UI component
│   │   ├── widget-anchor.js    # 3-tier adaptive positioning engine
│   │   └── keyboard-fixes.js   # Shift+2 and Alt+R key handlers
│   ├── adapters/
│   │   ├── base-adapter.js     # Abstract adapter interface
│   │   ├── antigravity-ide.js  # Antigravity IDE adapter
│   │   ├── vscode-cline.js     # Cline extension adapter
│   │   ├── vscode-continue.js  # Continue extension adapter
│   │   ├── vscode-roocode.js   # Roo Code extension adapter
│   │   └── generic-webview.js  # Universal fallback adapter
│   ├── injectors/
│   │   ├── electron-html.js    # Workbench HTML patcher
│   │   ├── electron-asar.js    # ASAR extractor & repacker
│   │   └── vscode-extension.js # VS Code & webview injector
│   └── utils/
│       ├── path-resolver.js    # Cross-platform installation finder
│       ├── checksum.js         # product.json SHA-256 calculator
│       └── backup.js           # Safe backup & rollback manager
├── scripts/
│   └── build-payloads.js       # Bundler for standalone payloads
└── dist/
    ├── antigravity-ide.payload.js
    ├── vscode.payload.js
    └── antigravity-chat.payload.js
```

---

### 📄 License

MIT © [Masoud Kakouei](https://github.com/Masoud-Kakouei)
