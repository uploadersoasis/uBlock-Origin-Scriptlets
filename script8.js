/// override-let-func.js
/// alias override-let-func
/// world MAIN
function overrideletfunc(selector) {
    //if (!selector) { return; }
    const applyHook = () => {
        try {
            new Function(`
                try {
                    // 1. Check window property
                    if (typeof window['${selector}'] !== 'undefined') {
                        const original = window['${selector}'];
                        window['${selector}'] = function(...args) {
                            console.log('[uBO Intercept] ${selector}:', args);
                            return original.apply(this, args);
                        };
                        return;
                    }
                    // 2. Check top-level lexical variable (let / var)
                    if (typeof ${selector} !== 'undefined') {
                        const original = ${selector};
                        ${selector} = function(...args) {
                            console.log('[uBO Intercept] ${selector}:', args);
                            return original.apply(this, args);
                        };
                    }
                } catch (innerErr) {
                    console.error('[uBO Intercept Error]', innerErr);
                }
            `)();
        } catch (err) {
            console.error('[uBO override-let-func Error]', err);
        }
    };
    // Immediate attempt (if script already loaded)
    applyHook();
    // Deferred attempt once DOM and inline scripts finish parsing
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyHook, { once: true });
    }
}
