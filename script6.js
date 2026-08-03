/// override-let-func.js
/// alias override-let-func
/// world MAIN

function overrideletfunc(selector = '') {
    if (!selector) { return; }

    const hook = () => {
        try {
            // Direct global assignment on the selector parameter passed by uBO
            new Function(`${selector} = function(...args) { console.log('[uBO Intercept]', args); };`)();
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