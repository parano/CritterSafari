var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor

function GameboardReader(port, baudrate, callback) {
  this.sp = new SerialPort(port, {
    baudrate: baudrate,
    parser: serialport.parsers.readline("\n")
  });

  this.sp.on('open', function() {
    console.log('Port open');
  });

  this.sp.on('data', function(data) {
    callback(data);
  });
}


function logger(){
  var gbr = new GameboardReader("/dev/cu.usbmodem1411", 9600, function(data){
    console.log("data received: " + data);
  });
}

//logger();

module.exports = GameboardReader;


// Testing Serialport.js library:
//var serialport = require("serialport");
//var SerialPort = serialport.SerialPort; // localize object constructor

//var sp = new SerialPort("/dev/cu.usbmodem1411", {
//  baudrate: 9600,
//  parser: serialport.parsers.readline("\n")
//});

//sp.on('open', function() {
//  console.log('Port open');
//});

//sp.on('data', function(data) {
//  console.log(data);
//});

