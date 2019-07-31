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

})