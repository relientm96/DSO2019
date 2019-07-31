#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WiFiMulti.h> 
#include <ESP8266mDNS.h>
#include <ESP8266WebServer.h>

//Constants
#define DATA_LEN  65536
#define WIFI_NAME "mattMI"
#define WIFI_PASS "badbedbada"

//Creating a multiwii class 
ESP8266WiFiMulti wifiMulti;     
ESP8266WebServer server(80);    

//Data buffer
char data[DATA_LEN];

//HTTP Handlers
void handleData();              
void handleNotFound();
void handleDSOConfigs();

void setup(void){

  //Adding Wifi Connection Details
  wifiMulti.addAP(WIFI_NAME, WIFI_PASS);   

  // Wait for Wi-Fi Connection
  while (wifiMulti.run() != WL_CONNECTED) { 
    delay(200);
  }          

  // Start the mDNS responder for dsoServer.local
  MDNS.begin("dsoServer");          

  //Route function handlers to uri paths
  server.on("/", HTTP_GET, handleRoot);  
  server.on("/config", HTTP_POST, handleDSOConfigs);  
  //serve any request for any unknown URI   
  server.onNotFound(handleNotFound);       

  //Start Server
  server.begin();                         
}

void loop(void){
  // Listen for HTTP requests from clients continuosly
  server.handleClient();                    
}

//Here we read data from DSO and send it to server
void handleData() {                         
  server.send(200,"text/plain","This is the root handler of the ESP8266 Server");
  /*Read from RAM and send it to server */
}

//Sends DSO configurations to DSO from web
void handleDSOConfigs(){
  server.send(200,"text/plain","This is the configuration handler of the ESP8266 Server");
  /*Do something to send configs to DSO */
}

//Simple 404 Response
void handleNotFound(){
  server.send(404, "text/plain", "404: Not found"); 
}
