/// override-let-func.js
/// alias override-let-func
/// world MAIN

function overrideletfunc(...args) {
    // Extract selector cleanly regardless of how uBO serialized arguments
    const selector = typeof args[0] === 'string' ? args[0].trim() : '';
    //if (!selector) { return; }

    const hook = () => {
        try {
            // Direct top-level execution using dynamic Function
            new Function(`
                try {
                    if (typeof ${selector} !== 'undefined') {
                        const original = ${selector};
                        ${selector} = function(...fnArgs) {
                            console.log('[uBO Intercept] ${selector}:', fnArgs);
                            return original.apply(this, fnArgs);
                        };
                    }
                } catch (e) {
                    console.error('[uBO override-let-func inner]', e);
                }
            `)();
        } catch (err) {
            console.error('[uBO override-let-func]', err);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hook, { once: true });
    } else {
        hook();
    }
}