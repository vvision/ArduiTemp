var request = require('request');
var spawn = require('child_process').spawn;
var fs = require('fs');
var model = 'atmega328';//Replace with your model ID. (See: ino list-models)
var blinkDelay = 0;//Exemple: 1000 / 50
var refresh = 60000;//Expressed in seconds

var begin = "#include <avr/pgmspace.h>  //AVR library for writing to ROM\n #include <Charliplexing.h> //Imports the library, which needs to be initialized in setup.\n //Sets the time each frame is shown (milliseconds) \nconst unsigned int blinkdelay = " + blinkDelay + ";\n PROGMEM const uint16_t BitMap[][9] = {";
var end = "{18000}};\n void setup() {\n LedSign::Init(DOUBLE_BUFFER | GRAYSCALE);  //Initializes the screen\n }\n void loop() {\n for (uint8_t gray = 1; gray < SHADES; gray++)DisplayBitMap(gray);  //Displays the bitmap\n }\n void DisplayBitMap(uint8_t grayscale){\n boolean run=true;    //While this is true, the screen updates\n byte frame = 0;      //Frame counter\n byte line = 0;       //Row counter\n unsigned long data;  //Temporary storage of the row data\n unsigned long start = 0;\n while(run == true) {\n for(line = 0; line < 9; line++) {\n //Here we fetch data from program memory with a pointer.\n data = pgm_read_word_near (&BitMap[frame][line]);//Kills the loop if the kill number is found\n if (data==18000){\n run=false;\n }\n //This is where the bit-shifting happens to pull out each LED from a row. If the bit is 1, then the LED is turned on, otherwise it is turned off.\n else\n for (byte led=0; led<14; ++led) {\n if (data & (1<<led)) {\n LedSign::Set(led, line, grayscale);\n }else {\n LedSign::Set(led, line, 0);}\n }\n }LedSign::Flip(true);\n  unsigned long end = millis();\n unsigned long diff = end - start;\n if ( start && (diff < blinkdelay) )delay( blinkdelay - diff );\n start = end;\n frame++;  }\n }";

retrieveAndDisplay();//Immediate initialization

//Update temperature every
setInterval(function() {
	retrieveAndDisplay();
}, refresh);

//Retrieve the current temperature
function retrieveAndDisplay() {
	request('http://api.wunderground.com/api/e5531d42c9ae4d4a/forecast/conditions/lang:FR/q/France/Belfort.json', function (error, response, body) {
		if (!error && response.statusCode == 200) {
		  //console.log(body)
		  var temperature = JSON.parse(body).current_observation.temp_c;
		  console.log('Current Temperature: ' + temperature);
		  writeCode(temperature, function() {displayTemp(temperature, model);});
		} else {
			console.error(error);
		}
	});
}

//Write the code which will run on the arduino
function writeCode(temperature, callback) {
	var firstDigit = Math.floor(temperature / 10);
	var secondDigit = Math.floor(temperature % 10);
	
	var num1 = computeLeds(firstDigit, 0);
	var num2 = computeLeds(secondDigit, 6);
	
	var number = addition(num1, num2);
	var leds = addition(number, degree());
	
	fs.writeFile('src/sketch.ino', begin + "{" + leds + "}," + end, function (err) {
		if (err) throw err;
		callback();
	});
}

//Build and upload the code on the arduino using ino
function displayTemp(temperature, model) {
	var build = spawn('ino', ['build', '-m', model], {stdio: 'ignore'});
	build.on('exit', function (code) {
		console.log('Ino build process exited with exit code ' + code);
		var upload = spawn('ino', ['upload', '-m', model], {stdio: 'ignore'});
		build.on('exit', function (code) {
			console.log('Ino upload process exited with exit code ' + code);
		});	
		
	});
}

//Find the right function to use to compute leds to be turned on
function computeLeds(number, position) {
	switch(number) {
		case 0:
			return zero(position);
			break;
		case 1:
			return one(position);
			break;
		case 2:
			return two(position);
			break;
		case 3:
			return three(position);
			break;
		case 4:
			return four(position);
			break;
		case 5:
			return five(position);
			break;
		case 6:
			return six(position);
			break;
		case 7:
			return seven(position);
			break;
		case 8:
			return eight(position);
			break;
		case 9:
			return nine(position);
			break;
		default:
			return [0, 0, 0, 0, 0, 0, 0, 0, 0];
			break;
	};
}

//Just the addition of two array of leds
function addition(array1, array2) {
	return [0, array1[1] + array2[1], array1[2] + array2[2], array1[3] + array2[3], array1[4] + array2[4], array1[5] + array2[5], array1[6] + array2[6], array1[7] + array2[7], 0]
}

//Display degree symbol
function degree() {	
	return [0, 4096, 10240, 4096, 0, 0, 0, 0, 0];
}

//Display numbers
//Position = first led upper left from 0 to 9
function zero(position) {
	var l1 = Math.pow(2, position + 1) + Math.pow(2, position + 2) + Math.pow(2, position + 3);
	var l2 = Math.pow(2, position + 0) + Math.pow(2, position + 4);
	var l3 = Math.pow(2, position + 0) + Math.pow(2, position + 4);
	var l4 = Math.pow(2, position + 0) + Math.pow(2, position + 2) + Math.pow(2, position + 4);
	var l5 = Math.pow(2, position + 0) + Math.pow(2, position + 4);
	var l6 = Math.pow(2, position + 0) + Math.pow(2, position + 4);
	var l7 = Math.pow(2, position + 1) + Math.pow(2, position + 2) + Math.pow(2, position + 3);
	
	return [0, l1, l2, l3, l4, l5, l6, l7, 0];
}

function one(position) {
	var l1 = Math.pow(2, position + 2);
	var l2 = Math.pow(2, position + 1) + Math.pow(2, position + 2);
	var l3 = Math.pow(2, position + 2);
	var l4 = Math.pow(2, position + 2);
	var l5 = Math.pow(2, position + 2);
	var l6 = Math.pow(2, position + 2);
	var l7 = Math.pow(2, position + 1) + Math.pow(2, position + 2) + Math.pow(2, position + 3);
	
	return [0, l1, l2, l3, l4, l5, l6, l7, 0];
}

function two(position) {
	var l1 = Math.pow(2, position + 1) + Math.pow(2, position + 2) + Math.pow(2, position + 3);
	var l2 = Math.pow(2, position + 0) + Math.pow(2, position + 4);
	var l3 = Math.pow(2, position + 3);
	var l4 = Math.pow(2, position + 2);
	var l5 = Math.pow(2, position + 1);
	var l6 = Math.pow(2, position + 0);
	var l7 = Math.pow(2, position + 0) + Math.pow(2, position + 1) + Math.pow(2, position + 2) + Math.pow(2, position + 3) + Math.pow(2, position + 4);
	
	return [0, l1, l2, l3, l4, l5, l6, l7, 0];
}

function three(position) {
	var l1 = Math.pow(2, position + 0) + Math.pow(2, position + 1) + Math.pow(2, position + 2) + Math.pow(2, position + 3) + Math.pow(2, position + 4);
	var l2 = Math.pow(2, position + 3);
	var l3 = Math.pow(2, position + 2);
	var l4 = Math.pow(2, position + 3);
	var l5 = Math.pow(2, position + 4);
	var l6 = Math.pow(2, position + 0) + Math.pow(2, position + 4);
	var l7 = Math.pow(2, position + 1) + Math.pow(2, position + 2) + Math.pow(2, position + 3);
	
	return [0, l1, l2, l3, l4, l5, l6, l7, 0];
}

function four(position) {
	var l1 = Math.pow(2, position + 3);
	var l2 = Math.pow(2, position + 2) + Math.pow(2, position + 3);
	var l3 = Math.pow(2, position + 1) + Math.pow(2, position + 3);
	var l4 = Math.pow(2, position + 0) + Math.pow(2, position + 3);
	var l5 = Math.pow(2, position + 0) + Math.pow(2, position + 1) + Math.pow(2, position + 2) + Math.pow(2, position + 3) + Math.pow(2, position + 4);
	var l6 = Math.pow(2, position + 3);
	var l7 = Math.pow(2, position + 3);
	
	return [0, l1, l2, l3, l4, l5, l6, l7, 0];
}

function five(position) {
	var l1 = Math.pow(2, position + 0) + Math.pow(2, position + 1) + Math.pow(2, position + 2) + Math.pow(2, position + 3) + Math.pow(2, position + 4);
	var l2 = Math.pow(2, position + 0);
	var l3 = Math.pow(2, position + 0) + Math.pow(2, position + 1) + Math.pow(2, position + 2) + Math.pow(2, position + 3);
	var l4 = Math.pow(2, position + 4);
	var l5 = Math.pow(2, position + 4);
	var l6 = Math.pow(2, position + 0) + Math.pow(2, position + 4);
	var l7 = Math.pow(2, position + 1) + Math.pow(2, position + 2) + Math.pow(2, position + 3);
	
	return [0, l1, l2, l3, l4, l5, l6, l7, 0];
}

function six(position) {
	var l1 = Math.pow(2, position + 2) + Math.pow(2, position + 3);
	var l2 = Math.pow(2, position + 1);
	var l3 = Math.pow(2, position + 0);
	var l4 = Math.pow(2, position + 0) + Math.pow(2, position + 1) + Math.pow(2, position + 2) + Math.pow(2, position + 3);
	var l5 = Math.pow(2, position + 0) + Math.pow(2, position + 4);
	var l6 = Math.pow(2, position + 0) + Math.pow(2, position + 4);
	var l7 = Math.pow(2, position + 1) + Math.pow(2, position + 2) + Math.pow(2, position + 3);
	
	return [0, l1, l2, l3, l4, l5, l6, l7, 0];
}

function seven(position) {
	var l1 = Math.pow(2, position + 0) + Math.pow(2, position + 1) + Math.pow(2, position + 2) + Math.pow(2, position + 3) + Math.pow(2, position + 4);
	var l2 = Math.pow(2, position + 4);
	var l3 = Math.pow(2, position + 3);
	var l4 = Math.pow(2, position + 2);
	var l5 = Math.pow(2, position + 1);
	var l6 = Math.pow(2, position + 1);
	var l7 = Math.pow(2, position + 1);
	
	return [0, l1, l2, l3, l4, l5, l6, l7, 0];
}

function eight(position) {
	var l1 = Math.pow(2, position + 1) + Math.pow(2, position + 2) + Math.pow(2, position + 3);
	var l2 = Math.pow(2, position + 0) + Math.pow(2, position + 4);
	var l3 = Math.pow(2, position + 0) + Math.pow(2, position + 4);
	var l4 = Math.pow(2, position + 1) + Math.pow(2, position + 2) + Math.pow(2, position + 3);
	var l5 = Math.pow(2, position + 0) + Math.pow(2, position + 4);
	var l6 = Math.pow(2, position + 0) + Math.pow(2, position + 4);
	var l7 = Math.pow(2, position + 1) + Math.pow(2, position + 2) + Math.pow(2, position + 3);
	
	return [0, l1, l2, l3, l4, l5, l6, l7, 0];
}

function nine(position) {
	var l1 = Math.pow(2, position + 1) + Math.pow(2, position + 2) + Math.pow(2, position + 3);
	var l2 = Math.pow(2, position + 0) + Math.pow(2, position + 4);
	var l3 = Math.pow(2, position + 0) + Math.pow(2, position + 4);
	var l4 = Math.pow(2, position + 1) + Math.pow(2, position + 2) + Math.pow(2, position + 3) + Math.pow(2, position + 4);
	var l5 = Math.pow(2, position + 4);
	var l6 = Math.pow(2, position + 3);
	var l7 = Math.pow(2, position + 1) + Math.pow(2, position + 2);
	
	return [0, l1, l2, l3, l4, l5, l6, l7, 0];
}

