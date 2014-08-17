var express = require('express');
var GameboardReader = require('./GameboardReader');
var _ = require('underscore');

var commandQueue = [];
var CommandList = []


var gbr = new GameboardReader("/dev/cu.usbmodem1411", 9600, function(data){
  console.log("data received: " + data);
});

var app = express();
var response_json = {test: true};

app.get('/test.json', function(req, res){
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(response_json));
});

var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});

