#include <Arduino.h>
#define BUTTON_PIN D6

void setup()
{
  Serial.begin(921600);
  Serial.println("Setup");
  pinMode(LED_BUILTIN, OUTPUT); // Initialize the LED_BUILTIN pin as an output
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  digitalWrite(LED_BUILTIN, HIGH);
}

int lastClick = 0;
void loop()
{

  // Serial.println(digitalRead(BUTTON_PIN));
  int now = millis();
  if (now - lastClick > 500 && !digitalRead(BUTTON_PIN))
  {
    Serial.println("clicked");
    lastClick = now;
  }

  // Serial.println(millis());

  delay(10);
  // digitalWrite(LED_BUILTIN, LOW); // Turn the LED on by making the voltage LOW
  // Serial.println("on");
  // delay(100);                      // Wait for a second
  // digitalWrite(LED_BUILTIN, HIGH); // Turn the LED off by making the voltage HIGH
  // Serial.println("off");
  // delay(200); // Wait for two seconds
}