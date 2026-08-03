/// override-let-func.js
/// alias override-let-func
/// world MAIN

function overrideletfunc(selector = '') {
    if (!selector) { return; }

    const hook = () => {
        try {
            // 1. Check window property
            if (typeof window[selector] === 'function') {
                const original = window[selector];
                window[selector] = function(...args) {
                    console.log(`[uBO Intercept] ${selector}:`, args);
                    return original.apply(this, args);
                };
                return;
            }

            // 2. Direct global scope mutation via top-level Function execution
            const interceptor = new Function(`
                try {
                    if (typeof ${selector} !== 'undefined') {
                        const original = ${selector};
                        ${selector} = function(...args) {
                            console.log('[uBO Intercept] ${selector}:', args);
                            return original.apply(this, args);
                        };
                    }
                } catch (e) {
                    console.error('[uBO override-let-func]', e);
                }
            `);
            interceptor();
        } catch (err) {
            console.error(`[uBO override-let-func] Error on ${selector}:`, err?.message);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hook, { once: true });
    } else {
        hook();
    }
}