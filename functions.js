function rng(min, max) {
    return Math.round(max / (Math.random() * max + min)); //calculate rng 
}

function addCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); //add commas to large numbers
}
function roundCents(x){
    return Math.round(x*100)/100 //round floats to hundreths
}


module.exports = {rng , addCommas, roundCents};