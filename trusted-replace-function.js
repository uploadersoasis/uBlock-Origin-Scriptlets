/*******************************************************************************
    uBlock Origin - a comprehensive, efficient content blocker
    Copyright (C) 2019-present Raymond Hill

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/gorhill/uBlock
*/

/*
 To use this file, trusted-replace-function.js, place it into uBlock Origin's
 src/js/resources subdirectory before building it into a web browser extension package.
 Alternatively, this file can be utilized by a pre-built uBlock Origin extension
 by placing a URI to this file in the value of the "userResourcesLocation" variable
 located on the "advanced settings" page.
*/

import { registerScriptlet } from './base.js';
import { safeSelf } from './safe-self.js';
import { runAt } from './run-at.js';

export function trustedReplaceFunctionFn(chain = '', body = '', runat = '', when = '') {
    const safe = safeSelf();
    const logPrefix = safe.makeLogPrefix('trusted-replace-function', chain, body, runat, when);
    // There are two log levels: "info" is the default equal to 1 and "error" is equal to 2.
    if (safe.logLevel > 1 && chain === '') {// >1 since an error message
        safe.uboErr(logPrefix, `trusted-replace-function: missing function path parameter`);
        // safe.log is console.log.
        //safe.log('[uBO][error] trusted-replace-function: missing function path parameter');
        //console.error('[uBO][error] trusted-replace-function: missing function path parameter');
        return;
    }

    const exec = () => {
        // Assume 'window.' if not specifically passed, but handle it cleanly if it is
        if (chain.startsWith('window.')) {
            chain = chain.slice(7);
        }

        // Ensure the function body has enclosing braces
        if (!body.startsWith('{')) { body = '{' + body; }
        if (!body.endsWith('}')) { body = body + '}'; }

        // Strip the outer braces for ingestion into the Function constructor
        const functionBody = body.slice(1, -1);
        
        const parts = safe.String_split.call(chain, '.');
        let owner = window;
        let prop;

        // Traverse the property chain to find the target owner object
        for (;;) {
            prop = parts.shift();
            if (parts.length === 0) { break; }
            owner = owner[prop];

            if (safe.logLevel > 1 && owner instanceof Object === false) {// >1 since an error message
                safe.uboErr(logPrefix, `trusted-replace-function: path, '${chain}', not found`);
                // safe.log is console.log.
                //safe.log(`[uBO][error] trusted-replace-function: path, '${chain}', not found`);
                //console.error(`[uBO][error] trusted-replace-function: path, '${chain}', not found`);
                return;
            }
        }

        // Ensure the targeted property exists and is a function
        if (safe.logLevel > 1 && (!prop || typeof owner[prop] !== 'function')) {// >1 since an error message
            safe.uboErr(logPrefix, `trusted-replace-function: Target, '${chain}', is not a valid function.`);
            // safe.log is console.log.
            //safe.log(`[uBO][error] trusted-replace-function: Target, '${chain}', is not a valid function.`);
            //console.error(`[uBO][error] trusted-replace-function: Target, '${chain}', is not a valid function.`);
            return;
        }

        const originalFn = owner[prop];
        const constructorName = originalFn.constructor ? originalFn.constructor.name : '';
        const isGenerator = constructorName === 'GeneratorFunction' || constructorName === 'AsyncGeneratorFunction';

        // Abort cleanly if the target function is a generator
        if (safe.logLevel > 1 && isGenerator) {// >1 since an error message
            safe.uboErr(logPrefix, `trusted-replace-function: Target, '${chain}', is a generator function (${constructorName}).  trusted-replace-function uses standard function instantiation which is incompatible with generators.`);
            // safe.log is console.log.
            //safe.log(`[uBO][error] trusted-replace-function: Target, '${chain}', is a generator function (${constructorName}).  trusted-replace-function uses standard function instantiation which is incompatible with generators.`);
            //console.error(`[uBO][error] trusted-replace-function: Target, '${chain}', is a generator function (${constructorName}).  trusted-replace-function uses standard function instantiation which is incompatible with generators.`);
            return;
        }

        const fnStr = originalFn.toString();

        // Extract the existing parameters to maintain compatibility with existing calls
        let paramsMatch = fnStr.match(/^[^(]*\(\s*([^)]*)\s*\)/);
        if (!paramsMatch) {
            // Fallback to match parameter-less or single-parameter arrow functions
            paramsMatch = fnStr.match(/^([^=]+)=>/);
        }
        
        const paramsStr = paramsMatch ? paramsMatch[1].trim() : '';
        const params = paramsStr ? paramsStr.split(',').map(p => p.trim()) : [];

        // Detect if the target function was created using .bind()
        const isBound = originalFn.name.startsWith('bound ') || ('prototype' in originalFn === false && !fnStr.includes('=>'));

        try {
            // Detect if the target is asynchronous to instantiate the correct constructor
            const isAsync = constructorName === 'AsyncFunction';
            const FnConstructor = isAsync ? Object.getPrototypeOf(async function(){}).constructor : Function;
            
            let newFn = new FnConstructor(...params, functionBody);

            // Spoof standard properties to mask the replacement from detection scripts
            Object.defineProperties(newFn, {
                name: { value: originalFn.name, configurable: true },
                length: { value: originalFn.length, configurable: true },
                toString: { value: () => fnStr, configurable: true }
            });

            // re-bind context only if the original target was previously bound
            if (isBound) {
                newFn = newFn.bind(owner);
            }

            owner[prop] = newFn;
            if (safe.logLevel >= 1) {// >= 1 since an info message
                safe.uboLog(logPrefix, 'Successfully replaced function body.');
                // safe.log is console.log.
                //safe.log([uBO][info] 'Successfully replaced function body.');
            }
        } catch (ex) {
            if (ex instanceof EvalError || ex.message.includes('unsafe-eval') || ex.message.includes('CSP')) {
                const host = window.location.hostname;
                if (safe.logLevel > 1) {// >1 since an error message
                    safe.uboErr(logPrefix, 
                        `trusted-replace-function: Function evaluation blocked by CSP on ${host}.\n` +
                        `To fix this, add the following rule to your 'My filters' tab:\n` +
                        `||${host}^$csp=script-src 'unsafe-eval'`
                    );
                }
                // safe.log is console.log.
                /*
                 safe.log(
                    `[uBO][error] trusted-replace-function: Function evaluation blocked by CSP on ${host}.\n` +
                    `To fix this, add the following rule to your 'My filters' tab:\n` +
                    `||${host}^$csp=script-src 'unsafe-eval'`
                 );
                /*
                console.error(
                    `[uBO][error] trusted-replace-function: Function evaluation blocked by CSP on ${host}.\n` +
                    `To fix this, add the following rule to your 'My filters' tab:\n` +
                    `||${host}^$csp=script-src 'unsafe-eval'`
                );
                 */
            } else {
                if (safe.logLevel > 1) {// >1 since an error message
                   safe.uboErr(logPrefix, `trusted-replace-function: Creation failed - ${ex.message}`);
                   // safe.log is console.log.
                   //safe.log(`[uBO][error] trusted-replace-function: Creation failed - ${ex.message}`);
                   //console.error(`[uBO][error] trusted-replace-function: Creation failed - ${ex.message}`);
                }
            }
        }
    };

    if (runat === 'runat' && when !== '') {
        runAt(exec, when);
    } else {
        exec();
    }
}

registerScriptlet(trustedReplaceFunctionFn, {
    name: 'trusted-replace-function.fn',
    dependencies: [
        safeSelf,
        runAt,
    ],
});

/******************************************************************************/
/*
 * @scriptlet trusted-replace-function.js
 *
 * @description
 * Replaces the execution body of an existing function at a specified object 
 * property path with custom JavaScript code provided as a string.
 *
 * The scriptlet dynamically constructs the replacement function while spoofing 
 * the original function's parameters, name, length, and `.toString()` output 
 * to prevent script detection. It automatically preserves `.bind()` context when 
 * detected, supports `async` functions, and outputs a pre-formatted `$csp` rule 
 * to the browser console if blocked by Content Security Policy restrictions.
 *
 * Note: Requires trust (`requiresTrust`).
 *       Generator functions (`function*`) are unsupported and will trigger an
 *       error log without modifying the target.
 *
 * @param chain
 * The dot-delimited object path targeting the function to replace 
 * (e.g., "Analytics.track" or "window.adblocker.check").
 *
 * @param [body]
 * The replacement JavaScript code string to execute inside the target function 
 * (e.g., "{ return true; }" or "console.log('Blocked'); return null;"). Outer 
 * braces are optional.
 *
 * @param [runat]
 * Optional keyword 'runat' to defer execution until a specific page-load milestone.
 *
 * @param [when]
 * Required parameter value for 'runat' which specifies the milestone target when
 * the rule's functionality is performed
 * The value must be 'interactive'/'end', 'complete'/'idle', or 'loading'/'asap'.
 *
 * @example
 * example.com##+js(trusted-replace-function, Analytics.track, { return true; }, runat, complete)
 *
 */

export function trustedReplaceFunction(...args) {
    trustedReplaceFunctionFn(...args);
}

registerScriptlet(trustedReplaceFunction, {
    name: 'trusted-replace-function.js',
    requiresTrust: true,
    dependencies: [
        trustedReplaceFunctionFn,
    ],
});
