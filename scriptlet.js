'use strict';

/// override-let-func.js
/// alias override-let-func
/// dependency run-at.fn
/// world ISOLATED
//  example.com##+js(override-let-func, window.alert)
function overrideletfunc(selector = '') {
    selector = '{{1}}'; // e.g., "calculateArea"
// Checks if the argument was left empty or wasn't provided at all
    if (!selector || selector === '{{1}}') { return; }
    runAt(( ) => {
        try {
            const scriptElem = document.createElement('script');
            // Executes in the root page scope (outside our IIFE)
            scriptElem.textContent = `
                if (typeof ${selector} === 'function') {
                    const original_${selector} = ${selector};
                    ${selector} = function(...args) {
                        console.log('Intercepted call to ${selector}:', args);
                        return original_${selector}.apply(this, args);
                    };
                }
            `;
            (document.head || document.documentElement).appendChild(scriptElem);
            scriptElem.remove();
        } catch (err) {
            console.error(err?.message);
        }
    }, 'complete');
}
