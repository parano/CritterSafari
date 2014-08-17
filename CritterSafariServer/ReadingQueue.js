var _ = require('underscore');

var validCommandPrefixs = [
  'hide character',
  'show character',
  'start',
  'set bg',
  'add object',
  'remove object'
];

var ReadingQueue = function(){
  this.queue = [];
  this.validPrefixs = validCommandPrefixs;
}

ReadingQueue.prototype.isValidCommand = function(data) {
  if(typeof(data) !== 'string' && data.length > 0) {
    return false;
  }

  // have valid prefix 
  return _.find(this.validPrefixs, function(prefix){
    return data.indexOf(prefix) !== -1;
  }) !== undefined;  
}

ReadingQueue.prototype.next = function() {
  return this.queue.shift();
}

ReadingQueue.prototype.push = function(data) {
  if(this.isValidCommand(data)) {
    console.log('pusing data to queue: ' + data);
    this.queue.push(data);
  }
}

ReadingQueue.prototype.isEmpty = function() {
  return this.queue.length === 0;
}

module.exports = ReadingQueue;
