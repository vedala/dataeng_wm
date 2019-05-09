function updateDivText() {
    var divElem = document.getElementById("div01");
    divElem.innerHTML = "Button clicked";
    var xhttp = new XMLHttpRequest();
    var that = this;
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var jsonResponse = JSON.parse(this.responseText);
            divElem.innerHTML = jsonResponse.body;
            displayChart('chart001', [1990, 1991, 1992], [20, 25, 30]);
        }
    };
    xhttp.open("GET",
        "https://iuesc2zye0.execute-api.us-east-1.amazonaws.com/prod", true);
    xhttp.send();
}

function displayChart(canvasElemName, labels, data) {
    var ctx = document.getElementById(canvasElemName).getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Weeks Data Available',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

document.addEventListener("DOMContentLoaded", function(event) {
    var elem = document.getElementById("button01");
    elem.addEventListener("click", updateDivText, false);
});
