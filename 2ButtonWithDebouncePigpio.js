const Gpio = require("pigpio").Gpio;

const nextButton = new Gpio(17, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_UP,
  edge: Gpio.FALLING_EDGE,
});

const reverseButton = new Gpio(22, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_UP,
  edge: Gpio.FALLING_EDGE,
});

// Set the debounce delay to 300 milliseconds
const debounceDelay = 300;

let nextButtonTimeout;
let reverseButtonTimeout;

console.log("GPIO Inputs Configured");

nextButton.on("interrupt", function (level) {
  // Check if the debounce timeout is still running
  if (nextButtonTimeout) {
    clearTimeout(nextButtonTimeout);
  }
  // Start a new debounce timeout
  nextButtonTimeout = setTimeout(() => {
    console.log("Next");
  }, debounceDelay);
});

reverseButton.on("interrupt", function (level) {
  // Check if the debounce timeout is still running
  if (reverseButtonTimeout) {
    clearTimeout(reverseButtonTimeout);
  }
  // Start a new debounce timeout
  reverseButtonTimeout = setTimeout(() => {
    console.log("Reverse");
  }, debounceDelay);
});

process.on("SIGINT", function () {
  console.log("\nExiting");
  process.exit();
});
