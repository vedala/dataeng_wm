var myChart1;
var myChart2;

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

    // Fetch element for error message and clear error message
    var errorElem = document.getElementById('analysis02-error');
    errorElem.innerHTML = ""

    var radios = document.getElementsByName('all_or_pick');
    var radioSelectedValue;
    for (var i = 0; i < radios.length; i += 1) {
        if (radios[i].checked) {
            radioSelectedValue = radios[i].value;
            break;
        }
    }

    if (!radioSelectedValue) {
        errorElem.innerHTML = "Radio button must be selected";
        return;
    }

    var checkboxes = document.getElementsByName('selected_holidays');
    var selectedHolidaysString = "&selectedHolidays=";
    var numChecked = 0;
    for (var i = 0; i < checkboxes.length; i += 1) {
        if (checkboxes[i].checked) {
            selectedHolidaysString += checkboxes[i].value + ","
            numChecked += 1;
        }
    }

    if (radioSelectedValue === "pick_holidays" && numChecked === 0) {
        errorElem.innerHTML = "At least one holiday must be picked";
        return;
    }

    var req = new XMLHttpRequest();
    req.overrideMimeType('application/json');
    req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var jsonResponse = JSON.parse(this.responseText);
            var labels = jsonResponse['body']['labels'];
            var data = jsonResponse['body']['rows'];
            displayChart2('chart02', labels, data);
        }
    };

    if (numChecked > 0) {
        // remove trailing comma
        selectedHolidaysString = selectedHolidaysString.slice(0, -1);
    }

    baseURL = "https://e5lfum0mci.execute-api.us-east-1.amazonaws.com/prod";
    queryString = `?allOrPick=${radioSelectedValue}`
    apiURL = baseURL + queryString;
    if (numChecked > 0) {
        apiURL += selectedHolidaysString;
    }

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
    if (myChart2) {
        myChart2.destroy();
    }

    //
    // extract groups labels, they are the first column of the "data" argument
    //
    var group_labels = [];
    data.forEach(function(elem) {
        group_labels.push(elem[0]);
    });

    bgColors = [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
    ];

    borderColors = [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ];

    //
    // create datasets array
    //
    var datasets_arr = [];
    for (i = 1; i < labels.length; i += 1) {
        var sub_group_label = labels[i];

        var sub_group_data = [];
        for (rowNum = 0; rowNum < data.length; rowNum += 1) {
            sub_group_data.push(data[rowNum][i]);
        }

        datasets_arr.push(
            {
            label: sub_group_label,
            data: sub_group_data,
            backgroundColor: bgColors[i-1],
            borderColor: borderColors[i-1],
            borderWidth: 1
            }
        );
    }

    myChart2 = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: group_labels,
            datasets: datasets_arr
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            title: {
                display: true,
                position: 'bottom',
                text: "Week-of-Holiday Sales Compared to Annual Weekly Average",
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
