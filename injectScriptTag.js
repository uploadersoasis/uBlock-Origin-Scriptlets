/// inject-script-tag.js
/// alias inject-script-tag
/// world MAIN
/// dependency run-at.fn
function injectScriptTag(selector, body) {
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
// example.com##+js(inject-script-tag, window.alert)
//'use strict';
