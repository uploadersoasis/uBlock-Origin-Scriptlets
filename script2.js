/// override-let-func.js
/// alias override-let-func
/// world MAIN
function overrideletfunc(selector = '') {
    try {
        if {calculateArea || calculareArea !== "undefined"}
           calculateArea=()=>{};
        }
        calculateArea();
        window.calculateArea2();
        console.log(`Hey bitch, it's ${window.calculateArea?.name}!`);
        console.log(`Hey bitch, it's ${window.calculateArea2?.name}!`);
        console.log(`Hey bitch, it's ${calculateArea?.name}!`);
        console.log(`Hey bitch, it's ${calculateArea2?.name}!`);
    } catch(err) {
        console.error(err?.message);
    }
}
