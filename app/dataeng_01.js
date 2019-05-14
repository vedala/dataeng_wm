var myChart1;

function fetchDataAndDisplayChart1() {
    var req = new XMLHttpRequest();
    req.overrideMimeType('application/json');
    req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var jsonResponse = JSON.parse(this.responseText);
            var labels = [];
            var data = [];
            bodyArray = jsonResponse['body'];
            bodyArray.forEach(function(elem) {
                labels.push(elem[0]);
                data.push(elem[1]);
            });
            displayChart1('chart01', labels, data);
        }
    };

    var startYearValue = document.getElementById('start_year').value;
    var endYearValue = document.getElementById('end_year').value;
    baseURL = "https://oqfjb7fjl3.execute-api.us-east-1.amazonaws.com/prod";
    queryString = `?startYear=${startYearValue}&endYear=${endYearValue}`
    apiURL = baseURL + queryString;
                
    req.open("GET", apiURL, true);
    req.send();
}

function displayChart1(canvasElemName, labels, data) {
    var ctx = document.getElementById(canvasElemName).getContext('2d');

    //
    // destroy chart element, if it has been created.
    // This is required to overcome chart.js issue where older chart
    // is displayed when hovering over a chart.
    //
    if (myChart1) {
        myChart1.destroy();
    }

    myChart1 = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
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

function fetchDataAndDisplayChart2() {
    var req = new XMLHttpRequest();
    req.overrideMimeType('application/json');
    req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var jsonResponse = JSON.parse(this.responseText);
            // var labels = [];
            // var data = [];
            // bodyArray = jsonResponse['body'];
            // bodyArray.forEach(function(elem) {
            //     labels.push(elem[0]);
            //     data.push(elem[1]);
            // });
            console.log(jsonResponse['body']);
            var labels = ["label1", "label2", "label3"];
            var data = [10, 20, 30];
            displayChart2('chart02', labels, data);
        }
    };

    var radios = document.getElementsByName('all_or_pick');
    var radioSelectedValue;
    for (var i = 0; i < radios.length; i += 1) {
        if (radios[i].checked) {
            radioSelectedValue = radios[i].value;
            break;
        }
    }

    var checkboxes = document.getElementsByName('selected_holidays');
    var selectedHolidaysString = "";
    for (var i = 0; i < checkboxes.length; i += 1) {
        if (checkboxes[i].checked) {
            if (selectedHolidaysString.length) {
                selectedHolidaysString += "&selectedHolidays=" + checkboxes[i].value
            } else {
                selectedHolidaysString += "selectedHolidays=" + checkboxes[i].value
            }
        }
    }

    baseURL = "https://e5lfum0mci.execute-api.us-east-1.amazonaws.com/prod";
    queryString = `?allOrPick=${radioSelectedValue}`
    apiURL = baseURL + queryString;
    apiURL += "&" + selectedHolidaysString;
                
    req.open("GET", apiURL, true);
    req.send();
}

function displayChart2(canvasElemName, labels, data) {
    var ctx = document.getElementById(canvasElemName).getContext('2d');

    //
    // destroy chart element, if it has been created.
    // This is required to overcome chart.js issue where older chart
    // is displayed when hovering over a chart.
    //
    if (myChart1) {
        myChart1.destroy();
    }

    myChart1 = new Chart(ctx, {
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
    var button1 = document.getElementById("button01");
    button1.addEventListener("click", fetchDataAndDisplayChart1, false);

    var button2 = document.getElementById("button02");
    button2.addEventListener("click", fetchDataAndDisplayChart2, false);
});
