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
  // is string and not empth
  if(typeof(data) !== 'string' && data.length > 0) {
    return false;
  }

  // don't put repeated data to queue
  if(data === _.last(this.queue)) {
    return false;
  }

  // have valid prefix 
  return _.find(this.validPrefixs, function(prefix){
    return data.indexOf(prefix) !== -1;
  }) !== undefined;  
}

ReadingQueue.prototype.isSettingCommand = function(command) {
  return _.find(
    [
      'hide character',
      'show character',
      'set bg',
      'add object',
      'remove object'
    ], 
    function(prefix){
      return command.indexOf(prefix) !== -1;
    }
  ) !== undefined;  
}

ReadingQueue.prototype.next = function() {
  return this.responseOject(this.queue.shift());
}

ReadingQueue.prototype.push = function(data) {
  if(this.isValidCommand(data)) {
    this.queue.push(data);
  }
}

ReadingQueue.prototype.isEmpty = function() {
  return this.queue.length === 0;
}

ReadingQueue.prototype.responseOject = function(s) {
  var response_object = {};

  if(this.isSettingCommand(s)) {
    response_object.type  = s.slice(0, s.lastIndexOf(' '));
    response_object.value = _.last(s.split(' ')); 
  } else if(s.indexOf('start') === 0) {
    response_object.type  = 'run';
    this.parseSteps(s, response_object);
  }
  return response_object;
}

ReadingQueue.prototype.parseSteps = function(s, res) {
  var seq = s.split('-');
  var numOfSteps = +seq[1];
  var numOfFuncSteps = +seq[numOfSteps + 2]; 

  var atSeq = function(i) {
    return seq[i];
  }

  if(numOfSteps > 0) {
    res.steps = _.map(_.range(2, 2+numOfSteps), atSeq);
  }

  if(numOfFuncSteps > 0) {
    res.func  = _.map(
      _.range(numOfSteps + 3, numOfSteps + 3 + numOfFuncSteps),
      atSeq
    );
  }
}

ReadingQueue.prototype.isValidSequence = function(seq) {

}

module.exports = ReadingQueue;
