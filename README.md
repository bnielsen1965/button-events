# Button Events

Button event module used to generate simple button events, i.e. *'clicked'*, *'double_clicked'*
from complex user interactions with a button input.

The module is used to create class instances each with a method that accepts a binary input
state that is called each time an input changes. The module then uses timing and the last
received input state to generate events to denote the user's intention.

Debounce logic is used to clean up noisy button signals and the module generates a variety of
high level button event types, i.e. *'clicked'*, *'double_clicked'*, *'pressed'*, *'released'*,
*'clicked_pressed'*.


# Usage

Create an instance of button-events for each button that requires events, add listeners
for the desired button events, and call the gpioChange(value) method each time the button
input state changes.

The gpioChange() method will return a status string to indicate how the value was handled.
- **"disabled"**, The button event handler is disabled and will not process gpioChange() values.
- **"debounced"**, The debounce timer is running and the input value has been updated with the last gpioChange() value.
- **"accepted"**, The gpioChange() value has been accepted as the starting value and the debounce timer started.
- **"final"**, The debounce timer is disabled and the gpioChange() value is accepted as the final value.


Example
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
**NOTE** The example assumes the *gpio* object has been instantiated from some gpio library.

A cleanup() method is provided to disable a button events instance, remove all listeners
and clear any active timers when the button events instance is no longer required.

Example
```javascript
const ButtonEvents = require('button-events');

// create event processor for up button
let bevents = new ButtonEvents();
// watch for 'clicked' events on the up button
bevents.on('button_event', (type) => {
  console.log(`Button event type ${type}`);
});

// run for 30 seconds then cleanup
setTimeout(() => {
  bevents.cleanup();
}, 30000);
```


# Debounce

When a hardware button is pressed or released it will initially produce an oscillating
electrical signal before stabilizing at a set level. The oscillation of the signal will
result in a bouncing value in the software that is monitoring the button signal.

A debounce algorithm in the software is used to eliminate the bounce by waiting for input
stabilization after a specified amount of time. The first call to gpioChange(value) will
record the value and start a timer for debounce stabilization. Each followup call to
gpioChange(value) will update the recorded input value. When the debounce timer completes the
final recorded value is processed as the stabilized input value.

Use the debounce timing value to adjust the debounce timer as needed for the hardware used.


## Disable Debounce

If debounce is already provided by the electronic circuit or the software library used
to monitor the button input then the debouce in the button-events instance should be
disabled to avoid unnecessary debounce delays.

To disable the debounce logic set the timing debounce value to 0.


# Configuration

The constructor for the button-events instance accepts a configuration object to adjust
the operation of the event processor. If the constructor is called without a configuration
object then the default values will be used.

Default configuration:
```javascript
const Defaults = {
  usePullUp: true,
  timing: {
    debounce: 30, // milliseconds to debounce input
    pressed: 200, // milliseconds to wait until we assume the user intended a button press event
    clicked: 200  // milliseconds to wait until we assume the user intended a button clicked event
  }
};
```

Example configuration with non-default values:
```javascript
let bevents = new ButtonEvents({
  usePullUp: false, // override defaults, circuit pulls buttons low when not pressed
  timing: {
    debounce: 0 // disable debounce, assume signal is debounced by circuit or gpio library
  },
  preread: inputValue // assign a preread value that was read from the gpio input before setting up button-events
});
```


## usePullUp

Boolean used to specify if the button gpio input is configured with a pull up resistor.
The default value is true which assumes the idle value for the input is 1 and when the
button on the input is pressed the value is 0.


## timing

The timing object in the configuration holds timing settings for the debounce logic
and the delays used for button transitions to different states for 'clicked', 'double_clicked', etc.


### timing.debounce

The debounce timing value is the number of milliseconds to wait before assuming the
input state has stabilized.

**NOTE** To disable debounce set the timing.debounce value to 0.


### timing.pressed

Milliseconds to wait after a button is pressed before settling on a pressed type event.


### timing.clicked

Milliseconds to wait after a button is released before settling on a clicked type event.


## preread

The button-events module assumes that the button is not pressed when the instance is
created. This assumption can be overridden by setting the *preread* binary value in
the configuration. This value should be read from the button input just before creating
the button-events instance for the button.


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
buttons.on('pressed', function () {
  console.log('User pressed button.');
});
```


## clicked
When a button is pressed and released rapidly this is interpreted as a click and results
in the emit of the clicked event.

```javascript
buttons.on('clicked', function () {
  console.log('User clicked button.');
});
```


## clicked_pressed
If a clicked event is detected and quickly followed by pressing and holding the button
then a clicked_pressed event will be emitted. Eventually when the button is released
then a released event will be emitted.

```javascript
buttons.on('clicked_pressed', function () {
  console.log('User clicked then pressed button.');
});
```


## double_clicked
If a clicked event is immediately followed with another clicked detection then it is
interpreted as a double click and a double_clicked event is emitted.

```javascript
buttons.on('double_clicked', function () {
  console.log('User double clicked button.');
});
```


## released
When one of the pressed type events is generated the button is placed in a state where
it will wait for the user to release the pressed button. When this happens the released
event is emitted.

```javascript
buttons.on('released', function () {
  console.log('User released button.');
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
