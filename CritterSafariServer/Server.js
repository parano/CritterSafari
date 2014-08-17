var express = require('express');
var GameboardReader = require('./GameboardReader');

var commandQueue = [];

var gbr = new GameboardReader("/dev/cu.usbmodem1411", 9600, function(data){
  console.log("data received: " + data);
  commandQueue.push(data);
});

var app = express();

app.get('/instruction.json', function(req, res){
  res.setHeader("Access-Control-Allow-Origin", "*");

  if(commandQueue.length === 0) {
    res.end(JSON.stringify({
      empty: true
    }));
  } else {
    res.end(JSON.stringify({
      empty: false,
      data: commandQueue.shift()
    }));
  }
});

var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});

