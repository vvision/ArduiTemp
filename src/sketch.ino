#include <avr/pgmspace.h>  //AVR library for writing to ROM
 #include <Charliplexing.h> //Imports the library, which needs to be initialized in setup.
 //Sets the time each frame is shown (milliseconds) 
const unsigned int blinkdelay = 0;
 PROGMEM const uint16_t BitMap[][9] = {{0,5006,11345,5192,1348,1090,1089,927,0},{18000}};
 void setup() {
 LedSign::Init(DOUBLE_BUFFER | GRAYSCALE);  //Initializes the screen
 }
 void loop() {
 for (uint8_t gray = 1; gray < SHADES; gray++)DisplayBitMap(gray);  //Displays the bitmap
 }
 void DisplayBitMap(uint8_t grayscale){
 boolean run=true;    //While this is true, the screen updates
 byte frame = 0;      //Frame counter
 byte line = 0;       //Row counter
 unsigned long data;  //Temporary storage of the row data
 unsigned long start = 0;
 while(run == true) {
 for(line = 0; line < 9; line++) {
 //Here we fetch data from program memory with a pointer.
 data = pgm_read_word_near (&BitMap[frame][line]);//Kills the loop if the kill number is found
 if (data==18000){
 run=false;
 }
 //This is where the bit-shifting happens to pull out each LED from a row. If the bit is 1, then the LED is turned on, otherwise it is turned off.
 else
 for (byte led=0; led<14; ++led) {
 if (data & (1<<led)) {
 LedSign::Set(led, line, grayscale);
 }else {
 LedSign::Set(led, line, 0);}
 }
 }LedSign::Flip(true);
  unsigned long end = millis();
 unsigned long diff = end - start;
 if ( start && (diff < blinkdelay) )delay( blinkdelay - diff );
 start = end;
 frame++;  }
 }