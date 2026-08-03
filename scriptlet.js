'use strict';

/// override-let-func.js
/// alias override-let-func
/// world ISOLATED
//  example.com##+js(override-let-func, window.alert)
function override-let-func (targetName = '') {
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
        console.err(err?.message);
    }
}

