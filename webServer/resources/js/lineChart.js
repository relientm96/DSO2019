const len    = 1000; //2^16 = 65536
var plotData = [];

//Data fetched from button click
function generateData(){
    for (i = 0; i < len ; i++){
        plotData[i] = Math.sin((Math.random()*5)) + Math.exp(-2*Math.random());
    }
    chart.series[0].setData(plotData);
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