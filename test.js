
const ButtonEvents = require('./index.js');

let passed;
let watch = () => passed = true;

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
  await test('Test clicked event...', click, 'clicked');
  await test('Test double_clicked event...', doubleClicked, 'double_clicked');
  await test('Test triple_clicked event...', tripleClicked, 'triple_clicked');
  await test('Test quadple_clicked event...', quadrupleClicked, 'quadruple_clicked');
  await test('Test press event..', pressRelease, 'pressed');
  await test('Test released event..', pressRelease, 'released');
  await test('Test clicked_pressed...', clickedPressedRelease, 'clicked_pressed');
  await test('Test double_clicked_pressed...', doubleClickedPressedRelease, 'double_clicked_pressed');
  await test('Test triple_clicked_pressed...', tripleClickedPressedRelease, 'triple_clicked_pressed');
}

async function test (msg, method, event) {
  passed = false;
  be.on(event, watch);
  console.log(msg);
  await method();
  await sleep(500);
  be.removeListener(event, watch);
  if (!passed) console.log('Test failed.');
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

async function tripleClicked () {
  await click();
  await sleep(100);
  await click();
  await sleep(100);
  await click();
}

async function quadrupleClicked () {
  await click();
  await sleep(100);
  await click();
  await sleep(100);
  await click();
  await sleep(100);
  await click();
}

async function pressRelease () {
  await press();
  await sleep(800);
  await release();
}

async function clickedPressedRelease () {
  return await clickedPressedCountRelease(1);
}

async function doubleClickedPressedRelease () {
  return await clickedPressedCountRelease(2);
}

async function tripleClickedPressedRelease () {
  return await clickedPressedCountRelease(3);
}

async function clickedPressedCountRelease (clicks) {
  for (let i =0; i < clicks; i++) {
    await click();
    await sleep(100);
  }
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
