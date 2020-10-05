
const ButtonEvents = require('./index.js');

let Noisy = true;

let be = new ButtonEvents();
setListeners(be);


console.log('Test with defaults...');
testSequence()
  .then(() => {
    return sleep(1000);
  })
  .then(() => {
    console.log('Test with debounce disabled...');
    Noisy = false;
    be = new ButtonEvents({ timing: { debounce: 0 } });
    setListeners(be);
    return testSequence();
  })
  .then(() => {
    return sleep(1000);
  });

function setListeners (bi) {
  bi.on('button_event', type => {
    console.log(`  Button event: ${type}.`);
  })
}

async function testSequence() {
  await click();
  await sleep(500);
  await doubleClicked();
  await sleep(500);
  await pressRelease();
  await sleep(500);
  await clickPressRelease();
}

async function click () {
  await press();
  await sleep(100);
  await release();
}

async function doubleClicked () {
  await click();
  await sleep(100);
  await click();
}

async function pressRelease () {
  await press();
  await sleep(800);
  await release();
}

async function clickPressRelease () {
  await click();
  await sleep(100);
  await pressRelease();
}

async function press () {
  await gpioChange(0, Math.floor(Math.random() * 3) + 1);
  if (!Noisy) return;
  await gpioChange(1, Math.floor(Math.random() * 3) + 1);
  await gpioChange(0, Math.floor(Math.random() * 3) + 1);
  await gpioChange(1, Math.floor(Math.random() * 3) + 1);
  await gpioChange(0, Math.floor(Math.random() * 3) + 1);
}

async function release () {
  await gpioChange(1, Math.floor(Math.random() * 3) + 1);
  if (!Noisy) return;
  await gpioChange(0, Math.floor(Math.random() * 3) + 1);
  await gpioChange(1, Math.floor(Math.random() * 3) + 1);
  await gpioChange(0, Math.floor(Math.random() * 3) + 1);
  await gpioChange(1, Math.floor(Math.random() * 3) + 1);
}

function gpioChange (value, timeout) {
  return new Promise((resolve, reject) => {
    let status = be.gpioChange(value);
    setTimeout(() => resolve(status), timeout);
  });
}

function sleep (ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}
