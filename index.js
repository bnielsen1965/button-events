
const EventEmitter = require('events').EventEmitter;

const STATE_IDLE = 1;
const STATE_PRESSED = 2;
const STATE_CLICKED = 3;
const STATE_CLICKED_PRESSED = 4;
const STATE_DOUBLE_CLICKED = 5;
const STATE_RELEASE_WAIT = 6;

// low level button state events
const EVENT_BUTTON_CHANGED = 'button_changed';
const EVENT_BUTTON_PRESS = 'button_press';
const EVENT_BUTTON_RELEASE = 'button_release';

// button event types
const EVENT_BUTTON_PRESSED = 'pressed';
const EVENT_BUTTON_CLICKED = 'clicked';
const EVENT_BUTTON_CLICKED_PRESSED = 'clicked_pressed';
const EVENT_BUTTON_DOUBLE_CLICKED = 'double_clicked';
const EVENT_BUTTON_RELEASED = 'released';

// unified button event type that passes the button event status
const EVENT_BUTTON_STATUS = 'button_event';

const Defaults = {
  usePullUp: true,
  timing: {
    debounce: 30, // milliseconds to debounce input
    pressed: 200, // milliseconds to wait until we assume the user intended a button press event
    clicked: 200  // milliseconds to wait until we assume the user intended a button clicked event
  }
};

class ButtonEvents extends EventEmitter {
  constructor (Config) {
    super();
    this.Config = Object.assign({}, Defaults, Config);
    this.Config.timing = Object.assign({}, Defaults.timing, this.Config.timing); // deep copy of timing defaults
    this.buttonState = STATE_IDLE;
    this.lastValue = (this.Config.usePullUp ? 1 : 0); // assume module starts with button not pressed
    this.currentValue = this.lastValue;
  }

  // called by parent when general purpose input value changes
  gpioChange (value) {
    value = (this.Config.usePullUp ? !value : value); // invert if pull up
    this.lastValue = value;
    if (!this.debounce) this.debounceStart(value);
  }

  // start the input signal debouce
  debounceStart (value) {
    this.currentValue = value;
    this.debounce = true;
    setTimeout(this.debounceComplete.bind(this), this.Config.timing.debounce);
  }

  // debouce timed out, complete button change
  debounceComplete () {
    this.emit(EVENT_BUTTON_CHANGED);
    if (this.lastValue) {
      // debounced button press
      this.emit(EVENT_BUTTON_PRESS);
      // determine how to handle button press based on current button state
      switch (this.buttonState) {
        case STATE_CLICKED:
          // transition from a clicked state to clicked and pressed
          clearTimeout(this.emitTimer);
          this.buttonState = STATE_CLICKED_PRESSED;
          break;

        default:
          // begin the pressed state
          clearTimeout(this.emitTimer);
          this.buttonState = STATE_PRESSED;
      }
      // delay event to allow for further state transition
      this.emitTimer = setTimeout(this.emitState.bind(this), this.Config.timing.pressed);
    }
    else {
      // debounced button release
      this.emit(EVENT_BUTTON_RELEASE);
      // determine how to handle button release based on current button state
      switch (this.buttonState) {
        case STATE_PRESSED:
          // transition from pressed to clicked
          clearTimeout(this.emitTimer);
          this.buttonState = STATE_CLICKED;
          // delay event to allow for further state transition
          this.emitTimer = setTimeout(this.emitState.bind(this), this.Config.timing.clicked);
          break;

        case STATE_CLICKED_PRESSED:
          // transition from clicked and pressed to double clicked
          clearTimeout(this.emitTimer);
          this.buttonState = STATE_DOUBLE_CLICKED;
          // no further transitions
          this.emitState();
          break;

        case STATE_RELEASE_WAIT:
          // transition from release wait to idle by emitting event
          clearTimeout(this.emitTimer);
          this.emitState();
          break;
      }
    }
    // debounce complete
    this.debounce = false;
  }

  // emit event for the current button state
  emitState() {
    switch (this.buttonState) {
      case STATE_PRESSED:
        // emit event and transition to release wait
        this.emit(EVENT_BUTTON_PRESSED);
        this.emit(EVENT_BUTTON_STATUS, EVENT_BUTTON_PRESSED);
        this.buttonState = STATE_RELEASE_WAIT;
        break;

      case STATE_CLICKED:
        // emit event and transition to idle
        this.emit(EVENT_BUTTON_CLICKED);
        this.emit(EVENT_BUTTON_STATUS, EVENT_BUTTON_CLICKED);
        this.buttonState = STATE_IDLE;
        break;

      case STATE_CLICKED_PRESSED:
        // emit event and transition to release wait
        this.emit(EVENT_BUTTON_CLICKED_PRESSED);
        this.emit(EVENT_BUTTON_STATUS, EVENT_BUTTON_CLICKED_PRESSED);
        this.buttonState = STATE_RELEASE_WAIT;
        break;

      case STATE_DOUBLE_CLICKED:
        // emit event and transition to idle
        this.emit(EVENT_BUTTON_DOUBLE_CLICKED);
        this.emit(EVENT_BUTTON_STATUS, EVENT_BUTTON_DOUBLE_CLICKED);
        this.buttonState = STATE_IDLE;
        break;

      case STATE_RELEASE_WAIT:
        // emit event and transition to idle
        this.emit(EVENT_BUTTON_RELEASED);
        this.emit(EVENT_BUTTON_STATUS, EVENT_BUTTON_RELEASED);
        this.buttonState = STATE_IDLE;
        break;
    }

    this.emitTimer = null;
  }
}

module.exports = ButtonEvents;