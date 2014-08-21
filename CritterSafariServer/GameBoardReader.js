var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor

function GameboardReader(port, baudrate, callback) {
  this.sp = new SerialPort(port, {
    baudrate: baudrate,
    parser: serialport.parsers.readline("\r\n")
  });

  this.sp.on('open', function() {
    console.log('Serial Port: ' + port + 
                ", start listening at baudrate: " + baudrate);
  });

  this.sp.on('data', function(data) {
    callback(data);
  });
}

module.exports = GameboardReader;
