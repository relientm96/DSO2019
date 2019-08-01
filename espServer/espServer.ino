#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WiFiMulti.h>
#include <ESP8266mDNS.h>
#include <ESP8266WebServer.h>

#include <string.h>

//Constants
#define DATA_LEN 255  //65536
//#define WIFI_NAME "mattMI"
//#define WIFI_PASS "badbedbada"
#define WIFI_NAME "Belong3D3DC4"
#define WIFI_PASS "tkab4pau6uqx"

//Creating a multiwii class
ESP8266WiFiMulti wifiMulti;
ESP8266WebServer server(80);

//Data buffer
//char data[DATA_LEN]    = "3,-1.5,2.5,3.4,5.12,-3.4,2.12,1.3,2.5";
char data[DATA_LEN]    = "0,1,2,3,4,5,4,3,2,1,0,-1,-2,-3,-4,-5,-4,-3,-2,-1,0";

//Configuration Variables
int numberOfSamples = 0;
int triggerValue    = 0;
byte sampleRate     = 0;
byte forceTrigger   = 0;
byte edgeTrigger    = 0;

//HTTP Handlers
void handleData();
void handleNotFound();
void handleDSOConfigs();
void handleVersion();

void setup(void) {
  Serial.begin(115200);
  delay(10);

  //Adding Wifi Connection Details
  wifiMulti.addAP(WIFI_NAME, WIFI_PASS);

  while (wifiMulti.run() != WL_CONNECTED) { // Wait for the Wi-Fi to connect: scan for Wi-Fi networks, and connect to the strongest of the networks above
    delay(200);
  }

  //Route function handlers to uri paths
  server.on("/", HTTP_GET, handleData);
  server.on("/version", HTTP_GET, handleVersion);
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
}

void loop(void) {
  // Listen for HTTP requests from clients continuosly
  server.handleClient();
}

//Here we read data from DSO and send it to server
void handleData() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  server.send(200, "text/plain", data);
  /*Read from MCU and send it to server */

}

//Sends DSO configurations to DSO from web
void handleDSOConfigs() {

  //Receiving request from client
  String message = server.arg("plain");
  message += "\n";

  Serial.println(message);

  byte i = 0;
  while (i < message.length() ) {
    char currentChar = message.charAt(i);
    if (currentChar == 'n') {
      int k = i + 1;
      char sampleChar;
      Serial.print("Sample Number: \n");
      while (sampleChar != ' ') {
        sampleChar = message.charAt(k);
        Serial.print(sampleChar);
        k++;
      }
      i = k - 1;
      Serial.print("\n");
    }
    if (currentChar == 't') {
      int k = i + 1;
      char sampleChar;
      Serial.print("Trigger Value: \n");
      while (sampleChar != ' ') {
        sampleChar = message.charAt(k);
        Serial.print(sampleChar);
        k++;
      }
      i = k - 1;
      Serial.print("\n");
    }
    if (currentChar == 's') {
      int k = i + 1;
      char sampleChar;
      Serial.print("Sampling Frequency: \n");
      while (sampleChar != ' ') {
        sampleChar = message.charAt(k);
        Serial.print(sampleChar);
        k++;
      }
      i = k - 1;
      Serial.print("\n");
    }
    if (currentChar == 'f') {
      int k = i + 1;
      char sampleChar;
      Serial.print("Force Trigger: \n");
      while (sampleChar != ' ') {
        sampleChar = message.charAt(k);
        Serial.print(sampleChar);
        k++;
      }
      i = k - 1;
      Serial.print("\n");
    }
    i++;
  }

  /*
    //Configuration Variables
    numberOfSamples = 0;
    triggerValue    = 0;
    sampleRate      = 0;
    forceTrigger    = 0;
    edgeTrigger     = 0;
  */

  //Respond to client
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  server.send(200, "text/plain", "Changed configurations");
}

void handleVersion() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  server.send(200, "text/plain", "DSO Version 1.0.0");
}

//Simple 404 Response
void handleNotFound() {
  server.send(404, "text/plain", "404: Not found");
}
