var Gpio = require("onoff").Gpio; //include onoff to interact with the G
var greenLED = new Gpio(4, "out"); //use GPIO pin 4 as output
var pushButtonNext = new Gpio(17, "in", "both"); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled
var redLED = new Gpio(27, "out")
var pushButtonReverse = new Gpio(22, "in", "both")

pushButtonNext.watch(function (err, value) { //Watch for hardware interrupts on pushButton GPIO, specify callback function
  if (err) { //if an error
    console.error('There was an error', err); //output error message to console
  return;
  }
  greenLED.writeSync(value); //turn LED on or off depending on the button state (0 or 1)
  return console.log("Next")
});

pushButtonReverse.watch(function (err, value) { //Watch for hardware interrupts on pushButton GPIO, specify callback function
    if (err) { //if an error
      console.error('There was an error', err); //output error message to console
    return;
    }
    redLED.writeSync(value); //turn LED on or off depending on the button state (0 or 1)
    return console.log("Reverse")
  });


function unexportOnClose() { //function to run when exiting program
  greenLED.writeSync(0); // Turn LED off
  redLED.writeSync(0);
  greenLED.unexport(); // Unexport LED GPIO to free resources
  redLED.unexport();
  pushButtonNext.unexport();
  pushButtonReverse.unexport(); // Unexport Button GPIO to free resources
};

process.on('SIGINT', unexportOnClose); //function to run when user closes using ctrl+c

