//Chart Scripts

const ESP_URL = "http://192.168.43.170"; //internal IP of ESP8266 from phone
//const ESP_URL = "http://10.0.0.15"; //internal IP of ESP8266 from home network

const len = numbSamples; //2^16 = 65536
var plotData = [];
var freqPlotData = [];
var freqPlotRaw = [];

// Map Function, referenced from Arduino
function map(x, in_min, in_max, out_min, out_max) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

// Data generated randomly (for test)
function generateData() {
    for (i = 0; i < len; i++) {
        plotDataValue = (2 * Math.round(Math.cos(2 * 3.142 * 200 * i)) + 127);
        plotData[i] = plotDataValue;
        //plotData[i] = map(plotDataValue, 0, 255, -5, 5);
    }
    document.getElementById("espstatus").innerHTML = "Generated Signal!";
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
    var freqPlotRaw = [];
    // Variables to try to get period
    var startingVal = 0;
    var flagToGetPeriod = 1;
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

                // Reading values into array
                valueRaw = parseInt(valuesArr[i]);
                valueOut = map(valueRaw, 0, 255, -5, 5) - 0.30; // Added offset to adjust plot
                freqPlotRaw.push(valueOut);
                plotData.push(valueOut);

                // Period calculations
                if (i == 0) {
                    // Get starting point value
                    startingVal = valueOut;
                } else {
                    // If close enough and first time and after 20 counts, we try to get period
                    if ((Math.abs(valueOut - startingVal) <= 0.1) && (flagToGetPeriod) && (i > 300)) {
                        period = 2 * i;
                        console.log(period);
                        periodCalc = period * (1 / (10 ^ 6));
                        // Do it once only
                        flagToGetPeriod = 0;
                    }
                }
            }
            // Compute DFT
            fftPlot(freqPlotRaw);
            // Plot data onto graph
            chart.series[0].setData(plotData);
            // Change status!
            if (document.getElementById("espstatus").textContent != "Generating Random Data!") {
                if (flagToGetPeriod == 0) {
                    document.getElementById("espstatus").innerHTML = "Got Data with Freq: " + periodCalc.toFixed(2) + " Hz";
                } else {
                    document.getElementById("espstatus").innerHTML = "Got Data!" + ", Waveform too slow to compute period";
                }
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

// Function to get sequence mean
function mean(numbers) {
    var total = 0;
    for (i = 0; i < numbers.length; i++) {
        total += numbers[i];
    }
    return total / numbers.length;
}

// Clear FFT Plot
function clearFFTPlot() {
    freqPlotData = [];
    document.getElementById("fftstatus").innerHTML = "Clearing Frequency Plot!";
    fftChart.series[0].setData(freqPlotData);
}

// DFT plotting function
function fftPlot(dataPoints) {
    freqPlotData = [];
    /*
    var meanSeq = mean(dataPoints);
    console.log("Mean is:" + meanSeq);
    for (j = 0; j < dataPoints.length; j++) {
        dataPoints[j] = dataPoints[j] - meanSeq;
    }
    */
    for (k = 0; k < dataPoints.length / 2; k++) {
        if (k == 0) {
            freqPlotData[k] = [k, 0];
        } else {
            var realPart = 0;
            var imPart = 0;
            for (n = 0; n < dataPoints.length; n++) {
                // theta = exp(-j2pikn/N)
                var theta = 2 * 3.142 * k * n * (1 / dataPoints.length);
                // Cos and Sine parts
                var cosTheta = Math.cos(theta);
                var sinTheta = Math.sin(theta);
                // Actual computation for term x[n]exp(-j2pikn/N)
                realPart += dataPoints[n] * cosTheta;
                imPart += dataPoints[n] * sinTheta;
            }
            //frequency = ((k * (10 ^ 6)) / (dataPoints.length));
            frequency = (k * (10 ^ 6)) / (dataPoints.length);
            //freqPlotData[k] = [frequency, math.sqrt(math.multiply(realPart, realPart) + math.multiply(imPart, imPart))];
            var magVal = math.sqrt(math.add(math.multiply(realPart, realPart), math.multiply(imPart, imPart)));
            // freqPlotData[k] = [frequency, Math.round(20 * Math.log10(magVal))]; // dB
            freqPlotData[k] = [frequency, Math.round(magVal)]; // Linear            
            console.log("Mag  = ", magVal)
        }

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
        },
    },
    xAxis: {
        title: {
            text: 'Sample Number'
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
            pointStart: 0,
            turboThreshold: 5000
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
        text: 'Frequency Plot using 5000 Point DFT'
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
            text: 'Frequency (Hz)'
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
        name: 'Magnitude (Linear)',
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