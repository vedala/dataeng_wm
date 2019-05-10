var myChart;

function fetchDataAndDisplayChart() {
    var xhttp = new XMLHttpRequest();
    xhttp.overrideMimeType('application/json');
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var jsonResponse = JSON.parse(this.responseText);
            var labels = [];
            var data = [];
            bodyArray = jsonResponse['body'];
            bodyArray.forEach(function(elem) {
                labels.push(elem[0]);
                data.push(elem[1]);
            });
            displayChart('chart01', labels, data);
        }
    };

    var startYearValue = document.getElementById('start_year').value;
    var endYearValue = document.getElementById('end_year').value;
    baseURL = "https://oqfjb7fjl3.execute-api.us-east-1.amazonaws.com/prod";
    queryString = `?startYear=${startYearValue}&endYear=${endYearValue}`
    apiURL = baseURL + queryString;
                
    xhttp.open("GET", apiURL, true);
    xhttp.send();
}

function displayChart(canvasElemName, labels, data) {
    var ctx = document.getElementById(canvasElemName).getContext('2d');

    //
    // destroy chart element, if it has been created.
    // This is required to overcome chart.js issue where older chart
    // is displayed when hovering over a chart.
    //
    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
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
                        beginAtZero: true,
                        max: 52,
                        stepSize: 12
                    }
                }]
            },
            legend: {
                display: false,
            },
            title: {
                display: true,
                position: 'bottom',
                text: "Data Availability, Number of Weeks per Year",
                fontSize: 14,
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

document.addEventListener("DOMContentLoaded", function(event) {
    var elem = document.getElementById("button01");
    elem.addEventListener("click", fetchDataAndDisplayChart, false);
});
