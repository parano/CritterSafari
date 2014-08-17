var _ = require('underscore');

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

var ReadingQueue = function(queueType){
  this.queue = [];

  if(queueType === 'command') {
    this.type = queueType;
    this.validPrefixs = validCommandPrefixs;
  } else if (queueType === 'setting') {
    this.type = queueType;
    this.validPrefixs = validSettingPrefixs;
  } else {
    console.log('Wrong queue type');
  }
}

ReadingQueue.prototype.isValidCommand = function(data) {
  // have valid prefix or is an integer
  return _.find(this.validPrefixs, function(prefix){
    return data.indexOf(prefix) !== -1;
  }) !== undefined || !isNaN(+data);
}

ReadingQueue.prototype.next = function() {
  while(!this.isValidCommand(this.queue[0])){
    this.queue.shift();
  }
  return this.queue.shift();
}

ReadingQueue.prototype.push = function(data) {
  if(typeof data === 'string' && data.length > 0) {
    this.queue.push(data);
  }
}

ReadingQueue.prototype.isEmpty = function() {
  return this.queue.length === 0;
}

module.exports = ReadingQueue;
