/// override-let-func.js
/// alias override-let-func
/// world MAIN

function overrideletfunc(selector = '') {
    if (!selector) { return; }

    const hook = () => {
        if (typeof window[selector] === 'function') {
            const original = window[selector];
            window[selector] = function(...args) {
                console.log('[uBO Intercept]', selector, args);
                return original.apply(this, args);
            };
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hook, { once: true });
    } else {
        hook();
    }
}