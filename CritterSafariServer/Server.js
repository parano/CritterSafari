var express = require('express');
var GameboardReader = require('./GameboardReader');
var ReadingQueue = require('./ReadingQueue');

var commandQueue = new ReadingQueue('command');
//var settingQueue = new ReadingQueue('setting');

var instructionBoard = new GameboardReader("/dev/cu.usbmodem1421", 9600, function(data){
  console.log("data received: " + data);
  commandQueue.push(data);
});

//var settingBoard = new GameboardReader("/dev/cu.usbmodem1411", 9600, function(data){
//  console.log("data received: " + data);
//  settingQueue.push(data);
//});

var app = express();

app.get('/instruction.json', function(req, res){
  res.setHeader("Access-Control-Allow-Origin", "*");

  if(commandQueue.isEmpty()) {
    res.end(JSON.stringify({
      empty: true
    }));
  } else {
    res.end(JSON.stringify({
      empty: false,
      data: commandQueue.next()
    }));
  }
});

var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});

