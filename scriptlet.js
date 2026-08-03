'use strict';

/// override-let-func.js
/// alias override-let-func
/// world ISOLATED
//  example.com##+js(override-let-func, window.alert)
function overrideletfunc(targetName = '') {
    targetName = '{{1}}'; // e.g., "calculateArea"
// Checks if the argument was left empty or wasn't provided at all
    if (!targetName || targetName === '{{1}}') { return; }
    try {
        const scriptElem = document.createElement('script');
        // Executes in the root page scope (outside our IIFE)
        scriptElem.textContent = `
            if (typeof ${targetName} === 'function') {
                const original_${targetName} = ${targetName};
                ${targetName} = function(...args) {
                    console.log('Intercepted call to ${targetName}:', args);
                    return original_${targetName}.apply(this, args);
                };
            }
        `;
        (document.head || document.documentElement).appendChild(scriptElem);
        scriptElem.remove();
    } catch (err) {
        console.error(err?.message);
    }
}


/// override-let-func2.js
/// alias override-let-func2
(function() {
    'use strict';

    // 1. Extract parameter replacement from uBO filter rule
    const targetName = '{{1}}'; // e.g., "calculateArea"

    // 2. Guard clause for missing or default arguments[cite: 1]
    if (!targetName || targetName === '{{1}}') { return; }

    try {
        const scriptElem = document.createElement('script');

        // 3. Executes in the root page scope (outside our IIFE)
        scriptElem.textContent = `
            if (typeof ${targetName} === 'function') {
                const original_${targetName} = ${targetName};
                ${targetName} = function(...args) {
                    console.log('Intercepted call to ${targetName}:', args);
                    return original_${targetName}.apply(this, args);
                };
            }
        `;

        (document.head || document.documentElement).appendChild(scriptElem);
        scriptElem.remove();
    } catch (err) {
        // Fail silently or log safely (console.error, not console.err)
        console.error(err?.message);
    }
})();
