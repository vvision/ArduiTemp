ArduiTemp
=========

ArduiTemp is a NodeJS program to display the temperature of a given city using an arduino and a [LOLShield](http://jimmieprodgers.com/kits/lolshield/).

Installation
============

* Clone it from Github: `https://github.com/vvision/ArduiTemp.git`
* Do `npm install` to perform installation
* Run with `node arduitemp.js`

Requirements
============

* NodeJs
* [Ino](https://github.com/amperka/ino)
* Api Key from [wunderground](http://www.wunderground.com/weather/api/)

Configuration
=============

Some parameters are available for customization.
* `apiKey`: Can be set in arduitemp.js or in a file named apiKey in the same directory.
* `model`: Your arduino model required to build and upload the code with ino. (See `ino list-models` for the complete list)
* `blinkDelay`: Set blink delay for the LOLShield
* `refresh`: Duration between each temperature update. Expressed in milliseconds
* `land`: Api Url parameter
* `city`: Api Url parameter
* `lang`: Api Url parameter

Licence
=======

