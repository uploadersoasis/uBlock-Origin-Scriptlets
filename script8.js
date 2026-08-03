/// override-let-func.js
/// alias override-let-func
/// world MAIN
function overrideletfunc(selector) {
    //if (!selector) { return; }
    try {
        // Direct execution in the global MAIN world scope
        new Function(`
            try {
                // Handle properties attached to window (e.g., calculateArea2)
                if (typeof window['${selector}'] === 'function') {
                    const original = window['${selector}'];
                    window['${selector}'] = function(...args) {
                        console.log('[uBO Intercept] ${selector}:', args);
                        return original.apply(this, args);
                    };
                    return;
                }
                // Handle top-level lexical variables (e.g., let calculateArea)
                if (typeof ${selector} === 'function') {
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
}
