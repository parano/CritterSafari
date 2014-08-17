var express = require('express');
var GameboardReader = require('./GameboardReader');
var _ = require('underscore');

var commandQueue = [];
var settingQueue = [];

var validCommandPrefixs = [
  'hide character',
  'show character',
  'start',
  'up',
  'down',
  'left',
  'right',
  'dance',
  'love',
  'tantrum',
  'magic',
  'function',
  'dressup',
  'sleep'
];
var isValidCommandPrefixs = function(data) {
  return _.find(validCommandPrefixs, function(prefix){
    return data.indexOf(prefix) !== -1;
  }) !== undefined || !isNaN(+data);
};
var commandQueueNext = function() {
  while(!isValidCommandPrefixs(commandQueue[0])){
    commandQueue.shift();
  }
  return commandQueue.shift();
};

//var settingQueueNext = function(data) {

//};


var instructionBoard = new GameboardReader("/dev/cu.usbmodem1421", 9600, function(data){
  console.log("data received: " + data);
  if(typeof data === 'string' && data.length > 0) {
    commandQueue.push(data);
  }
});

//var settingBoard = new GameboardReader("/dev/cu.usbmodem1411", 9600, function(data){
//  console.log("data received: " + data);
//  settingQueue.push(data);
//});


var app = express();

//app.get('/setting.json', function(req, res){
//  res.setHeader("Access-Control-Allow-Origin", "*");

//  if(settingQueue.length === 0) {
//    res.end(JSON.stringify({
//      empty: true
//    }));
//  } else {
//    res.end(JSON.stringify({
//      empty: false,
//      data: settingQueue.shift()
//    }));
//  }
//});

app.get('/instruction.json', function(req, res){
  res.setHeader("Access-Control-Allow-Origin", "*");

  if(commandQueue.length === 0) {
    res.end(JSON.stringify({
      empty: true
    }));
  } else {
    res.end(JSON.stringify({
      empty: false,
      data: commandQueueNext()
    }));
  }
});

var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});

