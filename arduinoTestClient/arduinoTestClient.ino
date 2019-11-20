/* Test Client to send data to ESP8266 acting as the DSO */

int sample_count;
char received;

void setup() {
  Serial.begin(115200);
}

void loop() {
  
  if(Serial.available() > 0){
    received = Serial.read();
    if (received == 's'){
      sample_count = 0;
      Serial.println(received);
      while( received != 'n'){
        Serial.write('3');
        sample_count++;
        if( sample_count >= 255){
          break;
        }
      }
    }
  } 

  delay(300);
}


