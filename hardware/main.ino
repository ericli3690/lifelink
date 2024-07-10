#include <WiFi.h>
#include <HTTPClient.h>

// Credentials censored for privacy reasons
const char* ssid = "****";
const char* password = "*******";

// Replace with your API endpoint
const char* serverName = "http://10.0.0.22:5000/";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  Serial.print("Connecting to Wi-Fi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("Connected.");

  // Check if WiFi is connected
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    // Specify the URL
    http.begin(serverName);

    // Specify content-type header
    http.addHeader("Content-Type", "application/json");

    // Data to send with HTTP POST
    String httpRequestData = "{\"name\":\"John\",\"age\":30}";

    // Send HTTP POST request
    int httpResponseCode = http.POST(httpRequestData);

    // If the response code is greater than 0, it means the request was successful
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println(httpResponseCode); // Print return code
      Serial.println(response); // Print request answer
    } else {
      Serial.print("Error on sending POST: ");
      Serial.println(httpResponseCode);
    }

    // Free resources
    http.end();
  } else {
    Serial.println("Error in WiFi connection");
  }
}

void loop() {
  // put your main code here, to run repeatedly:
}