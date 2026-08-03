/// override-let-func.js
/// alias override-let-func
/// world MAIN
/// dependency run-at.fn

function overrideletfunc(selector = '') {
    if (!selector) { return; }

    runAt(() => {
        if (typeof window[selector] === 'function') {
            const original = window[selector];
            window[selector] = function(...args) {
                console.log('[uBO Intercept]', selector, args);
                return original.apply(this, args);
            };
        }
    }, 'start'); // 'start' hooks early before page scripts run
}