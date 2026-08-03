/// override-let-func.js
/// alias override-let-func
/// dependency run-at.fn
/// world ISOLATED
//  example.com##+js(override-let-func, window.alert)
//'use strict';
function overrideletfunc(selector = '') {
    selector = '{{1}}'; // e.g., "calculateArea2"
    // Checks if the argument was left empty or wasn't provided at all
    if (!selector || selector === '{{1}}') { return; }
    runAt(( ) => {
        try {
            const scriptElem = document.createElement('script');
            // Constructs and injects raw script into the page root scope
            scriptElem.textContent = `
                if (typeof ${selector} !== 'undefined') {
                    const original_${selector} = ${selector};
                    ${selector} = function(...args) {
                        console.log('[uBO] Intercepted call to ${selector}:', args);
                        return original_${selector}.apply(this, args);
                    };
                }
            `;
            (document.head || document.documentElement).appendChild(scriptElem);
            scriptElem.remove();
        } catch (err) {
            console.error(err?.message);
        }
    }, 'idle');  // start, interactive, idle are the three choices
}
