# Button Events

Button event module used to debounce a digital input signal and produce button action events.

The module provides a method that accepts a binary input state that is called each time
an input changes. The module then uses timing, the current input state, and the past
input state to generate events to denote the user's intention.

Debounce logic is used to clean up noisy button signals and the module generates a variety of
high level button event types, i.e. 'clicked', 'double_clicked', 'pressed', 'released',
'clicked_pressed'.


# Usage

Create an instance of button-events for each button that requires events, add listeners
for the desired button events, and call the gpioChange() method each time the button
input state changes.

```javascript
const ButtonEvents = require('button-events');

// create event processor for up button
let upEvents = new ButtonEvents();
// watch for 'clicked' events on the up button
upEvents.on('clicked', () => {
  console.log('User clicked up.');
});

// each time gpio input for up button changes call the upEvents gpioChange() method
gpio.on('change', (value) => upEvents.gpioChange(value));
```


# Configuration

The constructor for the button-events instance accepts a configuration object to adjust
the operation of the event processor.

Example:
```javascript
let bevents = new ButtonEvents({
  usePullUp: true,
  timing: {
    debounce: 30, // milliseconds to debounce input
    pressed: 200, // milliseconds to wait until we assume the user intended a button press event
    clicked: 200  // milliseconds to wait until we assume the user intended a button clicked event
  }
});
```


## usePullUp

Boolean used to specify if the button gpio input is configured with a pull up resistor.
The default value is true which assumes the idle value for the input is 1 and when the
button on the input is pressed the value is 0.


## timing

The timing object in the configuration holds timing settings for the debounce logic
and the delays used for button transitions to different states for clicked, double clicked, etc.


### timing.debounce

The debounce timing value is the number of milliseconds to wait before assuming the
input state has stabilized.


### timing.pressed

Milliseconds to wait after a button is pressed before settling on a pressed type event.


### timing.clicked

Milliseconds to wait after a button is released before settling on a clicked type event.


# Events

The package provides a variety of high level button events to which an application can bind.

Possible events include the following...

**Events that indicate user intent**
- pressed
- clicked
- clicked_pressed
- double_clicked
- released

**Unified event for user intent, passes the user event state**
- button_event

**Low level events**
- button_changed
- button_press
- button_release


## pressed

The pressed event is emitted when a button is pressed and held down. This will eventually
be followed with a released event when the button is released.

```javascript
buttons.on('pressed', function (pin) {
  console.log('User pressed button on pin ', pin);
});
```


## clicked
When a button is pressed and released rapidly this is interpreted as a click and results
in the emit of the clicked event.

```javascript
buttons.on('clicked', function (pin) {
  console.log('User clicked button on pin ', pin);
});
```


## clicked_pressed
If a clicked event is detected and quickly followed by pressing and holding the button
then a clicked_pressed event will be emitted. Eventually when the button is released
then a released event will be emitted.

```javascript
buttons.on('clicked_pressed', function (pin) {
  console.log('User clicked then pressed button on pin ', pin);
});
```


## double_clicked
If a clicked event is immediately followed with another clicked detection then it is
interpreted as a double click and a double_clicked event is emitted.

```javascript
buttons.on('double_clicked', function (pin) {
  console.log('User double clicked button on pin ', pin);
});
```


## released
When one of the pressed type events is generated the button is placed in a state where
it will wait for the user to release the pressed button. When this happens the released
event is emitted.

```javascript
buttons.on('released', function (pin) {
  console.log('User released button on pin ', pin);
});
```


## button_event
The button_event event is a unified event triggered in combination with the user intent
events and will pass the value of the user intent as an argument.

```javascript
button.on('button_event', (type) => {
  switch (type) {
    case 'clicked':
    console.log('User clicked.');
    break;

    case 'double_clicked':
    console.log('User double clicked.');
    break;
  }
});
```


## button_changed
This is a low level event and is only used in special circumstances. The button_changed
event occurs anytime there is a button press or release. This event may be accompanied
by the higher level events that detect user intention, i.e. clicked, double_clicked, etc.


## button_press
This is a low level event and is only used in special circumstances. When the user presses
a button the button_press event will occur. This may be accompanied by other high level
events that detect user intent.


## button_release
This is a low level event and is only used in special circumstances. A button_release
event occurs whenever the user releases a button. This may be accompanied by other high
level events that detect user intent.
