var typed1 = document.getElementById("t1");
var typed2 = document.getElementById("t2");
var typed3 = document.getElementById("t3");

var display1 = document.getElementById("d1");
var display2 = document.getElementById("d2");
var display3 = document.getElementById("d3");
var display4 = document.getElementById("d4");

var start = function start(){
    
}

var display = function display(obj){
    obj.style.display = "inline";
}

var type = function type(obj,num){
    obj.style.animation = str("type".concat(num.toString()))
}
