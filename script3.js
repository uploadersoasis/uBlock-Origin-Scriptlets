/// override-let-func.js
/// alias override-let-func
/// world MAIN

function overrideletfunc(selector = '') {
    if (!selector) { return; }

    const hook = () => {
        try {
            // Case 1: Function attached directly to window (e.g., window.calculateArea2)
            if (typeof window[selector] === 'function') {
                const original = window[selector];
                window[selector] = function(...args) {
                    console.log(`[uBO Intercept] ${selector}:`, args);
                    return original.apply(this, args);
                };
                return;
            }

            // Case 2: Lexically-scoped function (e.g., let calculateArea)
            const exists = eval(`typeof ${selector} !== 'undefined'`);
            if (exists && typeof eval(selector) === 'function') {
                const original = eval(selector);
                eval(`${selector} = function(...args) {
                    console.log(\`[uBO Intercept] ${selector}:\`, args);
                    return original.apply(this, args);
                };`);
            }
        } catch (err) {
            console.error(`[uBO override-let-func] Error hooking ${selector}:`, err?.message);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hook, { once: true });
    } else {
        hook();
    }
}