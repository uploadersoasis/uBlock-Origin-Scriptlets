/// override-let-func.js
/// alias override-let-func
/// world MAIN

(function() {
    'use strict';

    const selector = '{{1}}';
    if (!selector || selector === '{{1}}') { return; }

    const hook = () => {
        try {
            const code = `
                try {
                    if (typeof ${selector} !== 'undefined') {
                        const original = ${selector};
                        ${selector} = function(...args) {
                            console.log('[uBO Intercept] ${selector}:', args);
                            return original.apply(this, args);
                        };
                    }
                } catch(e) {}
            `;
            const scriptEl = document.createElement('script');
            scriptEl.textContent = code;
            (document.head || document.documentElement).appendChild(scriptEl);
            scriptEl.remove();
        } catch (err) {
            console.error('[uBO override-let-func]', err);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hook, { once: true });
    } else {
        hook();
    }
})();