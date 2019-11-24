//Main JS 

var sampleRate  = 40;
var numbSamples = 10000;
var triggerVal  = 1; 

var forceTrigger = 0;
var edgeTrigger =  0;

const CONFIG_URL =  "http://10.0.0.6/config";
const ESP_URL_VER = "http://10.0.0.6/version";

$( document ).ready(function() {

    generateData();
    $("#generateBtn").click(function(){
        generateData();
        /*
        $.ajax({
            url: "http://18.139.115.251/remote/mario",
            type: 'POST',
            success: function (result) {
                document.getElementById("playSongTextHolder").innerHTML = result;
            },
            error: function (){
                document.getElementById("playSongTextHolder").innerHTML = "I don't think the sensor is on...";
            }
        });*/
    });

    $("#plotDataBtn").click(pollData);
    $("#configBtn").click(changeConfig);

    $("#verBtn").click(function(){
        $.ajax({
            url: ESP_URL_VER,
            type: 'GET',
            success: function (result) {
                alert("Version number: " + result);
            },
            error: function (){
                alert("Unable to receive version number from ESP8266");
            }
        });
    })

    $(".numbSampDial").knob({
        "min": 1000,
        "max": 65000,
        "width": 150,
        "height": 150,
        "change" : function (v) {
             numbSamples = v;
        }        
    });

    $(".triggerDial").knob({
        "min": -5,
        "max": 5,
        "width": 150,
        "height": 150,  
        "change" : function (v) {
            triggerVal = v;
       }        
    });
})

//Read all values function
function readConfigs(){
    //Reading Radio Values
    if (document.getElementById('40MhzRadio').checked) {
        sampleRate = 40;
    }
    if (document.getElementById('20MhzRadio').checked) {
        sampleRate = 20;
    }
    if (document.getElementById('10MhzRadio').checked) {
        sampleRate = 10;
    }

    if (document.getElementById('yesForceTrigger').checked) {
        forceTrigger = 1;
    }
    if (document.getElementById('noForceTrigger').checked) {
        forceTrigger = 0;
    }

    if (document.getElementById('yesRising').checked) {
        edgeTrigger = 1;
    }
    if (document.getElementById('yesFalling').checked) {
        edgeTrigger = 0;
    }
}

//Print configuration function for debug
function printConfig(){
    console.log("Number of Samples:",Math.floor(numbSamples));
    console.log("Trigger value:",Math.floor(triggerVal));
    console.log("Sample Rate:",sampleRate);
    console.log("Force Trigger:",forceTrigger);
    console.log("Edge Trigger:",edgeTrigger);
}

//Send Configurations to MCU
function changeConfig(){
    readConfigs();
    printConfig();

    var message = "n"   + Math.floor(numbSamples)   + " " +
                  "t"   + Math.floor(triggerVal)    + " " +
                  "s"   + Math.floor(sampleRate)    + " " + 
                  "f"   + Math.floor(forceTrigger)  + " " +
                  "e"   + Math.floor(edgeTrigger);
    
    console.log(message)

    //Send data to ESP8266 via POST request
    $.ajax({
        url: CONFIG_URL,
        type: 'POST',
        dataType: 'text',
        data: message,
        success: function (result) {
            alert("Sent Configs to ESP8266!")
        },
        error: function (){
            alert("Error in sending configs to ESP8266!")
        }
    });
}
