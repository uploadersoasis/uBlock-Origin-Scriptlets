/// override-let-func.js
/// alias override-let-func
/// world MAIN
function overrideletfunc(selector = 'testing') {
    const hook = () => {
        try {
            if (arguments) {
               console.info(`Argument 1 is [arguments[0].`);
            }
        } catch (err) {
            console.error('[uBO override-let-func]', err);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hook, { once: true });
    } else {
        hook();
    }
}