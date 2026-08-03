/// override-let-func.js
/// alias override-let-func
/// world MAIN
/// dependency run-at.fn
function overrideletfunc(selector, body) {
    runAt(() => {
        try {
            const scriptElem = document.createElement('script');
            // Constructs and injects raw script into the page root scope
            scriptElem.textContent = `${body}`;
            (document.head || document.documentElement).appendChild(scriptElem);
            //scriptElem.remove();
        } catch (err) {
            console.error(err?.message);
        }
    }, 'idle');  // start, interactive, idle are the three choices
}
// example.com##+js(override-let-func, window.alert)
//'use strict';
