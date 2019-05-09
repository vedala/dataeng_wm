function updateDivText() {
    var divElem = document.getElementById("div01");
    divElem.innerHTML = "Button clicked";
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            divElem.innerHTML = this.responseText;
        }
    };
    xhttp.open("GET",
        "https://iuesc2zye0.execute-api.us-east-1.amazonaws.com/prod", true);
    xhttp.send();
}

document.addEventListener("DOMContentLoaded", function(event) {
    var elem = document.getElementById("button01");
    elem.addEventListener("click", updateDivText, false);
});
