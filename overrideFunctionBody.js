/// override-function-body.js
/// alias override-function-body
/// world MAIN
function overrideFunctionBody(selector) {
    if (!selector) { return; }
    const applyHook = () => {
        try {
            new Function(`
                try {
                    // Check window property (e.g., var calculateArea2)
                    if (typeof window['${selector}'] !== 'undefined') {// TODO: assumes selector is a single keyword
                        const ${selector}Original = window['${selector}'];  // backup the function
                        window['${selector}'] = function(...args) {// override the function
                            console.info('[uBO] ${selector}:', args);
                            // call the original function
                            return typeof ${selector}Original === 'function' ? ${selector}Original.apply(this, args) : ${selector}Original;
                        };
                        return;
                    }
                    // Check top-level lexical variable (e.g., let calculateArea)
                    if (typeof ${selector} !== 'undefined') {
                        const ${selector}Original = ${selector};  // backup the function
                        ${selector} = function(...args) {// override the function
                            console.info('[uBO Intercept] ${selector}:', args);
                            // call the original function
                            return typeof ${selector}Original === 'function' ? ${selector}Original.apply(this, args) : ${selector}Original;
                        };
                    }
                } catch(innerErr) {
                    console.error('[uBO override-function-body Error]', innerErr);
                }
            `)();
        } catch(err) {
            console.error('[uBO override-function-body Error]', err);
        }
    };
    // deferred attempt once DOM and inline scripts finish parsing
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyHook, { once: true });
    } else {
        applyHook();  // immediate attempt if inline scripts already executed
    }
}
