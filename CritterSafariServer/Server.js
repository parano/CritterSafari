var express = require('express');
var GameboardReader = require('./GameboardReader');
var _ = require('underscore');

var commandQueue = [];
var settingQueue = [];

var isValidCommand = function(prefixs, data) {
  // have valid prefix or is an integer
  return _.find(prefixs, function(prefix){
    return data.indexOf(prefix) !== -1;
  }) !== undefined || !isNaN(+data);
};

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

var validSettingPrefixs = [
  'set bg',
  'add object',
  'remove object'
];

var commandQueueNext = function() {
  while(!isValidCommand(validCommandPrefixs, commandQueue[0])){
    commandQueue.shift();
  }
  return commandQueue.shift();
};


var settingQueueNext = function() {
  while(!isValidCommand(validSettingPrefixs, settingQueue[0])){
    settingQueue.shift();
  }
  return settingQueue.shift();
};

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

