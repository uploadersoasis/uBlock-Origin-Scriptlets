/// override-function-body.js
/// alias override-function-body
/// world MAIN
function overrideFunctionBody(selector, ...extraArgs) {
    if (!selector) { return; }
    // Check if the final argument passed from uBO is a boolean toggle
    let writeProtect = true;  // default value if unspecified
    // extraArgs is always an array and always empty if there are no entered arguments for it.
    if (extraArgs.length > 0) {
        const lastArg = String(extraArgs[extraArgs.length - 1]).trim().toLowerCase();
        if (lastArg === 'false') {
            writeProtect = false;
            extraArgs.pop();  // remove the last argument
        } else if (lastArg === 'true') {
            writeProtect = true;
            extraArgs.pop();  // remove the last argument
        }
    }
    // Make sure that selector is a valid Javascript variable name by replacing invalid characters with an underscore.
    selector = '${selector}'.replace(/[^a-zA-Z0-9_$]/g, '_')
    const backupVar = `${selector}Original`;
    // .join() always returns a string.
    // Treat all of extraArgs as the replacement body text string so putting the body in quotations is not required.
	// Do NOT use quotations inside the function body text IF the text is enclosed in quotation marks for the parameter/uBlock Origin rule, e.g. firefox.localhost##+js(override-function-body, calculateArea, "console.log("It works!");", true), since that triggers "SyntaxError: unexpected token: identifier".
    const rawReplacement = extraArgs.join(',').trim();  // no need to escape commas since it strips them
    // Substitute the generated backup variable name for the "<backup>" placeholder if it is contained in the replacement body.
    // "<backup>" must be surrounded by a space, linefeed, or select Javascript syntax characters or be at the end or beginning of the body text.
    // Otherwise fallback to calling the backup variable if it is a function or return it as-is if a value.
    // Unless saved to a globally scoped object or variable, the backup function can't be accessed or modified for reuse, and it will be lost if the replacement function gets overridden later by scripts used by the webpage to which this scriptlet is applied.
	// backupVar is not returned (appended to replacementCode automatically) if rawReplacement is provided.
    const replacementCode = rawReplacement
        ? rawReplacement.replace(/(?<=[\s;\,\{\}\[\]\(\)\&\|]|^)\<backup\>(?=[\s;\.\,\{\}\[\]\(\)\&\|]|$)/g, backupVar)
        : `return typeof ${backupVar} === "function" ? ${backupVar}.apply(this, args) : ${backupVar};`;
    const applyHook = () => {
        try {// create the replacement function from a string of raw code
            new Function(`
                try {
                    // Check window property, e.g. "var calculateArea2".
                    if (typeof window['${selector}'] !== 'undefined') {// TODO: assumes selector is a single keyword
                        const ${backupVar} = window['${selector}'];  // backup the function to local scope
                        const hookFn = function(...args) {// override the function
                            console.info('[uBO] ${selector}:', args);
                            ${replacementCode}
                        };
                        if (${writeProtect}) {// write-protect the replacement function by hooking the setter on the original variable
                            try {
                                Object.defineProperty(window, '${selector}', {
                                    get() { return hookFn; },
                                    set(newVal) {
                                        console.info('[uBO Intercept] Prevented site from overwriting ${selector}');
                                    },
                                    configurable: true
                                });
                            } catch (e) {
                                window['${selector}'] = hookFn;
                            }
                        } else {
                            window['${selector}'] = hookFn;
                        }
                        return;
                    }
                    // Handle top-level lexical variable, e.g. "let calculateArea"; cannot provide write-protect
                    if (typeof ${selector} !== 'undefined') {
                        const ${backupVar} = ${selector};  // backup the function to local scope
                        ${selector} = function(...args) {// override the function
                            console.info('[uBO Intercept] ${selector}:', args);
                            ${replacementCode}
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
// TODO: parse selector as a object property chain in dot and/or bracketed format.
//       Assign/backup the original function to a globally scoped variable so it is available if the replacement function gets overridden.
//       add native runat() support as the final parameters or make the function body string the last parameter?
//function overrideFunctionBody(selector, writeProtect=true, runat="runat", when="loading},...extraArgs) {
