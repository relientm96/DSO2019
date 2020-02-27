//Main JS 

// Configuration data for oscilloscope
var sampleRate = 40;
var numbSamples = 5000;
var triggerVal = 1;
var forceTrigger = 0;
var edgeTrigger = 0;
// Store configuration data as a string
var configDat;
// Flag to store continuos mode
var contMode = 0;

// URLS to ESP8266
const ESP_INTERNAL_IP = "10.0.0.16"; // From home network

// URLS for inner ESP8266 functions
const CONFIG_URL = "http://" + ESP_INTERNAL_IP + "/config";
const ESP_URL_VER = "http://" + ESP_INTERNAL_IP + "/version";
const ESP_URL_SCREEN = "http://" + ESP_INTERNAL_IP + "/screen";

// Save interval as an ID to be refered to later to resume/pause
var contModeIntervalID = setInterval(contModeIntervalID, 7000);

$(document).ready(function() {

    // Initializing all statuses
    document.getElementById("espstatus").innerHTML = "Welcome! Press Any Button Below!";
    document.getElementById("contStatus").innerHTML = "Cont mode Off!";
    document.getElementById("fftstatus").innerHTML = "Press to Plot DFT!";

    // Button routes
    $("#generateBtn").click(function() {
        //generateData();
        contMode = contMode ^ 1;
        if (contMode == 1) {
            document.getElementById("contStatus").innerHTML = "Cont mode On! Plotting every 10 seconds";
            contModeIntervalID = setInterval(pollData, 10000);
        } else {
            document.getElementById("contStatus").innerHTML = "Cont mode Off!";
            clearInterval(contModeIntervalID);
        }
    });
    $("#plotDataBtn").click(pollData);
    $("#configBtn").click(changeConfig);
    $("#clearBtn").click(clearPlot);
    $("#clearFFTBtn").click(clearFFTPlot);
    $("#generateRandData").click(generateData);
    $("#screenPlotBtn").click(function() {
        $.ajax({
            url: ESP_URL_SCREEN,
            type: 'GET',
            success: function(result) {
                alert("Plotting Plot onto OLED!");
            },
            error: function() {
                alert("Unable to plot data on screen of OLED");
            }
        });
    })
    $("#verBtn").click(function() {
        $.ajax({
            url: ESP_URL_VER,
            type: 'GET',
            success: function(result) {
                alert("Version number: " + result);
            },
            error: function() {
                alert("Unable to receive version number from ESP8266");
            }
        });
    })

    // Controls for configurations
    $(".numbSampDial").knob({
        "min": 1000,
        "max": 65000,
        "width": 150,
        "height": 150,
        "change": function(v) {
            numbSamples = v;
        }
    });
    $(".triggerDial").knob({
        "min": -5,
        "max": 5,
        "width": 150,
        "height": 150,
        "change": function(v) {
            triggerVal = v;
        }
    });

})

//Read all values function
function readConfigs() {
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
function printConfig() {
    console.log("Number of Samples:", Math.floor(numbSamples));
    console.log("Trigger value:", Math.floor(triggerVal));
    console.log("Sample Rate:", sampleRate);
    console.log("Force Trigger:", forceTrigger);
    console.log("Edge Trigger:", edgeTrigger);
}

//Send Configurations to MCU
function changeConfig() {
    readConfigs();
    printConfig();

    /*
    var message = "n" + Math.floor(numbSamples) + " " +
        "t" + Math.floor(triggerVal) + " " +
        "s" + Math.floor(sampleRate) + " " +
        "f" + Math.floor(forceTrigger) + " " +
        "e" + Math.floor(edgeTrigger);

    console.log(message)
    */
    var configDat = {
        "numberOfSamples": Math.floor(numbSamples),
        "triggerValue": Math.floor(triggerVal),
        "samplingFreq": Math.floor(sampleRate),
        "forceTrigger": Math.floor(forceTrigger),
        "edgeTrigger": Math.floor(edgeTrigger)
    }

    console.log(configDat);

    //Send data to ESP8266 via POST request
    $.ajax({
        url: CONFIG_URL,
        type: 'POST',
        dataType: 'text',
        data: JSON.stringify(configDat),
        success: function(result) {
            // Return configurations from MCU
            alert("New Configs: " + result);
        },
        error: function() {
            alert("Error in setting configs to ESP8266!");
        }
    });
}