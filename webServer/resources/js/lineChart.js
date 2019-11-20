//Chart Scriptsk

const ESP_URL = "http://192.168.43.170"; //internal IP of ESP8266 from phone
//const ESP_URL = "http://10.0.0.15"; //internal IP of ESP8266 from home network

const len = numbSamples; //2^16 = 65536
var plotData = [];
var freqPlotData = [];

// Map Function, referenced from Arduino
function map(x, in_min, in_max, out_min, out_max) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

// Data generated randomly (for test)
function generateData() {
    for (i = 0; i < len; i++) {
        plotData[i] = Math.sin(2 * 3.142 * 5 * i);
    }
    document.getElementById("espstatus").innerHTML = "Generating Random Data!";
    chart.series[0].setData(plotData);
    fftPlot(plotData);
}

// Clears plot
function clearPlot() {
    plotData = [];
    document.getElementById("espstatus").innerHTML = "Data Cleared!";
    chart.series[0].setData(plotData);
}

//Get data from sensor
function pollData() {
    // Initialize variables
    var plotData = [];
    // Set status
    document.getElementById("espstatus").innerHTML = "Loading Data from ESP8266...";
    // Send a GET Request to receive oscilloscope data from ESP8266
    $.ajax({
        url: ESP_URL,
        type: 'GET',
        success: function(result) {
            // Data sent , comma seperated from ESP8266
            var valuesArr = result.split(',');
            // Adding data to array and mapping from 0->255 (8 bit unsigned numbers) to , -5 -> 5 Volts
            for (i = 0; i < valuesArr.length; i++) {
                valueRaw = parseInt(valuesArr[i]);
                valueOut = map(valueRaw, 0, 255, -5, 5) - 0.30; // Added offset to adjust plot
                plotData.push(valueOut);
            }
            // Plot data onto graph
            chart.series[0].setData(plotData);
            // Change status!
            if (document.getElementById("espstatus").textContent != "Generating Random Data!") {
                document.getElementById("espstatus").innerHTML = "Successfully Connected to ESP8266!";
            }
        },
        // Handle errors when failed to connect to ESP8266
        error: function() {
            console.log("Error Occured in fetching data from sensor!");
            if (document.getElementById("espstatus").textContent != "Generating Random Data!") {
                document.getElementById("espstatus").innerHTML = "Cannot Get Data from ESP8266!";
            }
        }
    });
}

// Clear FFT Plot
function clearFFTPlot() {
    freqPlotData = [];
    document.getElementById("fftstatus").innerHTML = "Clearing Frequency Plot!";
    fftChart.series[0].setData(freqPlotData);
}

// FFT plotting function
function fftPlot(dataPoints) {
    var sum = 0;
    for (i = 0; i < dataPoints.length; i++) {

    }
    document.getElementById("fftstatus").innerHTML = "Plotting Frequency Plot!";
    fftChart.series[0].setData(freqPlotData);
}

//Plot using HighCharts
var chart = Highcharts.chart('containerPlot', {
    title: {
        text: 'Sampled Voltage Plot'
    },
    subtitle: {
        text: 'Matthew Yong - 2019'
    },
    yAxis: {
        title: {
            text: 'Voltage (V)'
        }
    },
    credits: {
        enabled: false
    },
    plotOptions: {
        series: {
            label: {
                connectorAllowed: false
            },
            pointStart: 0
        }
    },
    series: [{
        name: 'Voltage (V)',
        data: plotData
    }],
    responsive: {
        rules: [{
            condition: {
                maxWidth: 500
            },
            chartOptions: {
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom'
                }
            }
        }]
    }
});

// FFT Plot
var fftChart = Highcharts.chart('fftPlotContainer', {
    title: {
        text: 'Frequency Plot'
    },
    subtitle: {
        text: 'Matthew Yong - 2019'
    },
    yAxis: {
        title: {
            text: 'Magnitude (Linear)'
        }
    },
    xAxis: {
        title: {
            text: 'Frequency (f)'
        }
    },
    credits: {
        enabled: false
    },
    plotOptions: {
        series: {
            label: {
                connectorAllowed: false
            },
            pointStart: 0
        }
    },
    series: [{
        name: 'Magnitude (linear)',
        data: freqPlotData
    }],
    responsive: {
        rules: [{
            condition: {
                maxWidth: 500
            },
            chartOptions: {
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom'
                }
            }
        }]
    }
});