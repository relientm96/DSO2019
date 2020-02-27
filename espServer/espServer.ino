/*
 * ESP8266 Module for Digital Oscilloscope Project
 * Extension by Matthew Yong
 * Includes a Web Server and an I2C screen communication module
 */

/*----ESP8266 WIFI Modules----*/ 

#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WiFiMulti.h>
#include <ESP8266mDNS.h>
#include <ESP8266WebServer.h>

/*----Screen Modules----*/ 
// i2c Library
#include <Wire.h>
#include "SSD1306Wire.h"
#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels
// Declaration for an SSD1306 display connected to I2C (SDA, SCL pins)
#define OLED_RESET     4 // Reset pin # (or -1 for i2c)

/*---- Misc Modules ---*/
// String Module
#include <string.h>
// Arduino JSON functions
#include <ArduinoJson.h>

//Constants
#define DATA_LEN 5000
#define DATA_LEN_ARRAY 1000  
//#define WIFI_NAME "china"
//#define WIFI_PASS "bidibadadowop"
#define WIFI_NAME "Belong3D3DC4"
#define WIFI_PASS "tkab4pau6uqx"

//Creating a multiwii class
ESP8266WiFiMulti wifiMulti;
ESP8266WebServer server(80);

//Data buffer
String data;
int dataInt[DATA_LEN] = {0};
// Stores how many samples are used
int counter = 0;
// Index Tracker
int indexTrack = 0;

//Configuration Variables
int numberOfSamples = 0;
int triggerValue    = 0;
int sampleRate      = 0;
int forceTrigger    = 0;
int edgeTrigger     = 0;

//HTTP Handlers
void handleData();
void handleNotFound();
void handleDSOConfigs();
void handleVersion();

// Serial String data
String dsoVersionString = "";
// Config data as a string
String configDataString = "";
// Sends this data to browser
String dataToSendStr = "";

// Temporary Variables to hold temp DSO values
// Stores incoming data as an integer
int incomingData = 0;
// Stores incoming data as a string from DSO
String strDat = "";

// Creating Screen Object
SSD1306Wire display (0x3C, D1, D2);

/*-----------------Print Functions for OLED--------------------*/

// Print Config Data 
void printConfigs() {

  display.setLogBuffer(5, 30);

  String numberOfSamplesStr = "# Samples: ";
  numberOfSamplesStr += String(numberOfSamples, DEC);
  String triggerValueStr = "Trigger Value: ";
  triggerValueStr += String(triggerValue, DEC);
  String sampleRateStr = "Sample Rate: ";
  sampleRateStr += String(sampleRate, DEC);
  String forceTriggerStr = "Force Trigger: ";
  forceTriggerStr += String(forceTrigger, DEC);
  String edgeTriggerStr = "Edge Trigger: ";
  edgeTriggerStr += String(edgeTrigger, DEC);

  String message[] = {
      numberOfSamplesStr,
      triggerValueStr,
      sampleRateStr,
      forceTriggerStr,
      edgeTriggerStr
  };

  for (byte i = 0; i < 5; i++) {
    display.clear();
    // Print to the screen
    display.println(message[i]);
    // Draw it to the internal screen buffer
    display.drawLogBuffer(0, 0);
    // Display it on the screen
    display.display();
    delay(200);
  }
}

// Print any arbitary message onto OLED
void printMessage(String strArray[], int sizeOfArr) {
  
  display.setLogBuffer(5, 30);

  for (byte i = 0; i < sizeOfArr; i++) {
    display.clear();
    // Print to the screen
    display.println(strArray[i]);
    // Draw it to the internal screen buffer
    display.drawLogBuffer(0, 0);
    // Display it on the screen
    display.display();
    delay(500);
  }
}

// Draws Graph in OLED given an array of values
int drawGraph(int dataInt[], int startIndex){

  // Initialize from Origin
  int oldPositionX = 11;
  int oldPositionY = 32;

  // Start Drawing Graph Axes
  display.clear();
  display.drawString(0,0,"+5");
  display.drawString(0,50,"-5");
  display.drawLine(11,5,11,SCREEN_HEIGHT-1);
  display.drawLine(1,SCREEN_HEIGHT/2,SCREEN_WIDTH-1,SCREEN_HEIGHT/2);

  // Obtain length of array 
  int dataLength = sizeof(dataInt)/sizeof(dataInt[0]);

  // Start plotting on OLED
  int m = startIndex;
  int dat = 0;
  for (int i = 12 ; i < SCREEN_WIDTH; i++){
    //dat = 5*sin(0.25*m);
    dat = dataInt[m];
    if (dat >= 0){
      display.drawLine(oldPositionX,oldPositionY,i,32-5*abs(dat));
      oldPositionY = 32 - 5*abs(dat);
    }
    else {
      display.drawLine(oldPositionX,oldPositionY,i,5*abs(dat) + 32);      
      oldPositionY = 5*abs(dat) + 32;
    }
    oldPositionX = i;
    // Increment every nth sample to fit within screen (aliasing)
    //m = m + (int)(dataLength/(SCREEN_WIDTH - 1));   
    // First 127 samples
    m++; 
    display.display();
    delay(10);
  }
  
  display.display();

  return m;
}


void setup(void) {
  Serial.begin(38400);
  delay(10);

  //Initialize Screen
  display.init();
  display.setContrast(255);

  // Flip Screen
  display.flipScreenVertically();

  //Adding Wifi Connection Details
  wifiMulti.addAP(WIFI_NAME, WIFI_PASS);

  String wifiMessage[] = {
      "Welcome Back Master",
      "Trying to connect:",
      "To Wifi..."
  };
  printMessage(wifiMessage, 3);
    
  while (wifiMulti.run() != WL_CONNECTED) { 
    delay(200);
  }  
  
  display.clear();
  
  //Route function handlers to uri paths
  server.on("/", HTTP_GET, handleData);
  server.on("/version", HTTP_GET, handleVersion);
  server.on("/screen", HTTP_GET, handlePlotScreen);
  server.on("/config", HTTP_POST, handleDSOConfigs);
  //serve any request for any unknown URI
  server.onNotFound(handleNotFound);

  //Avoiding CORS Issue
  server.on("/", HTTP_OPTIONS, []() {
    server.sendHeader("Access-Control-Max-Age", "10000");
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    server.send(200, "text/plain", data );
  });

  //Start Server
  server.begin();

  // Print IP and SSID Details
  //printBuffer();
  String message[] = {
      "Welcome Back Master",
      "Connected to:",
      WiFi.SSID(),
      "Local IP:",
      WiFi.localIP().toString(),
  };
  printMessage(message, 5);
  delay(5000);
  display.clear();
}

void loop(void) {
  // Listen for HTTP requests from clients continuosly
  server.handleClient();

  // Print wait message
  String message[] = {
    "Waiting for User...",
    "To press plot DATA!",
    "Local IP:",
    WiFi.localIP().toString()  
  };
  printMessage(message, 4);

  delay(1000);
}

/*-------------------End Point Handlers------------------------*/

void handlePlotScreen(){
   String message[] = {
    "Plotting DSO Data",
    "Onto Screen!!",
  };
  printMessage(message, 2);
  delay(2000);

  server.send(200, "text/plain", "Plotted Onto Screen!");
  
  // Plot data onto OLED
  display.clear();
  indexTrack = 0;
  while(indexTrack < DATA_LEN_ARRAY){
    indexTrack = drawGraph(dataInt, indexTrack);
  }
  display.clear();

}

//Here we read data from DSO and send it to server
void handleData() {
  
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  // Clear Current Buffer
  while( Serial.available() ){
    Serial.read();
  }

  // Ask User to press capture on Computer GUI
  String waitMessage[] = {
  "Reading From DSO",
  "MAXIMUM 5000 Points!",
  "Press Capture on GUI!"
  };
  printMessage(waitMessage,3);

  // We want to get 1000 Data Points
  while (counter < DATA_LEN){
    // We will wait if there is available data
    while(!Serial.available());
    // Read the data in Serial buffer
    incomingData = Serial.read();
    // Read data from DSO
    if( incomingData > 0 ){
      // Add to data array 
      if (counter < DATA_LEN_ARRAY ){
        dataInt[counter] = map(incomingData,0,255,-5,5);
      }
      // Append new data as a string to be sent to browser later
      strDat = String(incomingData);
      dataToSendStr += strDat;
      dataToSendStr += ',';
      counter++;
    }
  }
  
  // Clear current wait message after finish reading 1000 points
  display.clear();
  // Print Successful Message
  String wait2Message[] = {
  "Successfully Read",
  "5000 Points on DSO!",
  "Sending to Browser...",
  "And Plotting!"
  };
  printMessage(wait2Message,4);
    
  // Sends back data to web browser
  server.send(200, "text/plain", dataToSendStr);
  // Reset data points
  dataToSendStr = "";
  display.clear();

/*
  // Plot data onto OLED
  display.clear();
  indexTrack = 0;
  while(indexTrack < DATA_LEN_ARRAY){
    indexTrack = drawGraph(dataInt, indexTrack);
  }
  
  delay(5000);
  display.clear();
*/
  // Reset Counter Variable
  counter = 0;
 
}

//Sends DSO configurations to DSO from web
void handleDSOConfigs() {

  // Parsing
  DynamicJsonDocument doc(147);
  DeserializationError err = deserializeJson(doc, server.arg("plain"));

  if (err){
   // Serial.print("ERROR:");
   // Serial.println(err.c_str());
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    server.send(200, "text/plain", "Changed configurations");
    return;
  }

  // Reading configuration variables from JSON
  numberOfSamples = doc["numberOfSamples"]; 
  triggerValue = doc["triggerValue"]; 
  sampleRate = doc["samplingFreq"]; 
  forceTrigger = doc["forceTrigger"]; 
  edgeTrigger = doc["edgeTrigger"]; 

  // Displaying Results on OLED Screen
  display.clear();
  // Print Config Message Change
  String numberOfSamplesStr = "# Samples: ";
  numberOfSamplesStr += String(numberOfSamples, DEC);
  String triggerValueStr = "Trigger Value: ";
  triggerValueStr += String(triggerValue, DEC);
  String sampleRateStr = "Sample Rate: ";
  sampleRateStr += String(sampleRate, DEC);
  String forceTriggerStr = "Force Trigger: ";
  forceTriggerStr += String(forceTrigger, DEC);
  String edgeTriggerStr = "Edge Trigger: ";
  edgeTriggerStr += String(edgeTrigger, DEC);
  String configMessageStringDisplay[] = {
      numberOfSamplesStr,
      triggerValueStr,
      sampleRateStr,
      forceTriggerStr,
      edgeTriggerStr
  };
  printMessage(configMessageStringDisplay,5);
  delay(4000);

  // Start configuring DSO
  Serial.write('n');
  /*
  // Send values to DSO (Based on DSO Code)
  // Number of Samples Adjustment
  Serial.write('Z');
  Serial.write(numberOfSamples);
  // Trigger Value Change
  Serial.write('t');
  Serial.write(triggerValue);
  */
  // Sampling Frequency Adjustment
  Serial.write('r');
  if( sampleRate == 40 ){
    Serial.write('1'); 
  }
  else if( sampleRate == 20 ){
    Serial.write('2');
  }
  else{
    Serial.write('3');
  }
  // Edge Trigger
  Serial.write('i');
  if(edgeTrigger == 0){
    // Falling Edge
    Serial.write('f');
  }
  else{
    // Rising Edge
    Serial.write('r');
  }

  // Send back config data as a string from dso to see updated change
  /*
  Serial.write('c');
  while (Serial.available()) {
    // get the new byte:
    char inChar = (char)Serial.read();
    // Letter
    if (isalpha(inChar)){
      // add it to the inputString:
      configDataString += inChar; 
    }
    //Numbers
    else {
      int numb = (int)inChar;
      String str = String(numb);
      configDataString += str;
    }
  }
  */

  //Respond to client with new MCU configs
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  server.send(200, "text/plain", configDataString);

  // Reset config string 
  configDataString = "";
}

void handleVersion() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  // Set OLED State Display
  display.clear();
  // Print State
  String message[] = {"Reading Version", "From DSO", "Press DSO Version", "on GUI..."};
  printMessage(message, 4);
  delay(300);
  display.clear();

  //Clear Buffer 
  while(Serial.available()>0){
    Serial.read();
  }
  
  // Wait for incoming data from DSO
  while (!Serial.available());
  // Read String Data
  dsoVersionString = Serial.readString();
  
  // Print Finished State
  String message2[] = {"Finished Reading Version: ",dsoVersionString};
  printMessage(message2, 2);
  delay(2000);
  display.clear();

  // Return Version String back to Browser
  server.send(200, "text/plain", dsoVersionString);
  // Reset to empty string
  dsoVersionString = "";
}

//Simple 404 Response
void handleNotFound() {
  server.send(404, "text/plain", "404: Not found");
}




