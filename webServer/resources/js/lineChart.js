//Chart Scripts
const ESP_URL = "http://10.0.0.6"; //10.0.0.6
const len     = 100; //2^16 = 65536
var plotData  = [];

// Data generated randomly
function generateData(){
    for (i = 0; i < len ; i++){
        plotData[i] = Math.sin((Math.random()*5)) + Math.exp(-2*Math.random());
    }
    chart.series[0].setData(plotData);
}

//Get data from sensor
function pollData(){
    var plotData = [];
    $.ajax({
        url: ESP_URL,
        type: 'GET',
        success: function (result) {
            for(i = 0; i < result.length ; i++){
                currentChar = result.charAt(i);
                if(currentChar != ',') {
                    if(currentChar == '-'){
                        negativeChar = currentChar + result.charAt(i+1);
                        plotData.push(parseInt(negativeChar));
                        i++;
                    }
                    else {
                        plotData.push(parseInt(currentChar));
                    }
                }
            }
            chart.series[0].setData(plotData);
            document.getElementById("espstatus").innerHTML = "Successfully Connected to ESP8266!";
        },
        error: function (){
            console.log("Error Occured in fetching data from sensor!");
            document.getElementById("espstatus").innerHTML = "Cannot Get Data from ESP8266!";
        }
    });
}

//Plot using HighCharts
var chart = Highcharts.chart('containerPlot', {
    title: {
        text: 'Digital Oscilloscope Plot'
    },
    subtitle: {
        text: 'Matthew Yong - 2019'
    },
    yAxis: {
        title: {
            text: 'Voltage (V)'
        }
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