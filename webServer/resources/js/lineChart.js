//Chat js render methods

const numData  =  100;
var plotData   =  [];
var xLabelData =  [];

//Globals
Chart.defaults.global.defaultFontFamily = 'Roboto';

//Generate data function
function generateData(){
    var plotData = [];
    var xLabelData = [];
    for (let i = 0; i < numData ; i++){
        plotData[i] = Math.floor((Math.random()*5)) + 1;
        xLabelData[i] = i;
    }
    myChart.data.datasets[0].data =  plotData;   
    myChart.data.labels = xLabelData;   
    myChart.update();
}

var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: xLabelData,
        datasets: [{
            label: 'DSO Plot',
            data: plotData,
            backgroundColor: 'rgba(107, 185, 240, 1)',
            fill: false,
            borderColor: 'rgba(107, 185, 240, 1)',
            borderWidth: 2.5,
        }]
    },
    options : {
        legend:{
            position:'top',
            labels:{
                fontColor:'#000'
            }
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                }
            }]
        },
        layout:{
            padding: 10
        },
    }
});