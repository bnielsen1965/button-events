
const EventEmitter = require('events').EventEmitter;

const STATE_WAIT = 0;
const STATE_COUNTING = 1;

class Trainer extends EventEmitter {
  constructor (buttonEvents, trainTime) {
    super();
    this.state = STATE_WAIT;
    this.watchCount = 0;
    this.trainTime = trainTime || 1000;
    this.watchTimer;
    this.watchStart;
    this.watchLast;
    buttonEvents.on('button_changed', this.buttonChanged.bind(this));
  }

  // button_changed event handler
  buttonChanged () {
    if (this.state === STATE_WAIT) {
      this.emit(`training_start`);
      this.state = STATE_COUNTING;
      this.watchStart = Date.now();
      this.watchLast = this.watchStart;
      this.watchTimer = setTimeout(this.watchReport.bind(this), this.trainTime);
    }
    else {
      this.watchLast = Date.now();
      this.watchCount += 1;
    }
  }
  
  // report training results
  watchReport () {
    clearTimeout(this.watchTimer);
    this.emit('training_report', { count: this.watchCount, duration: this.watchLast - this.watchStart });
    this.state= STATE_WAIT;
    this.watchCount = 0;
    this.watchStart = Date.now();
    this.watchLast = this.watchStart;
  }


}

module.exports = Trainer;