function updateDivText() {
    var divElem = document.getElementById("div01");
    divElem.innerHTML = "Button clicked";
}

document.addEventListener("DOMContentLoaded", function(event) {
    var elem = document.getElementById("button01");
    elem.addEventListener("click", updateDivText, false);
});
