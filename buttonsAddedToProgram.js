const readline = require('readline'); //enables the readline module so that so that we can handle user input line by line.
const fs = require('fs'); //enables the file system module so that the pizzaArray can be saved at the end. 
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
}); // defines an interface that reads input from command line.


//imports pigpio module to handle Gpio pins
const Gpio = require('pigpio').Gpio;

// configures two buttons
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

/* these three variables are used to debounce the shitty buttons i bought *sigh*. 
Debounce delay can be set here but it really does need to be that high.
Two variables are left blank because they will be used to store values later */

const debounceDelay = 300;
let nextButtonTimeout;
let reverseButtonTimeout;

// defines the array that will be the list, and the counters that are used to navigate it.

const pizzaArray = [];
let currentPizzaIndex = 0;
let uniqueCustomerNumber = 1 

// defines variables for the button presses.

let nextButtonPress = nextButton.on("interrupt", function (level) {
  // Check if the debounce timeout is still running
  if (nextButtonTimeout) {
    clearTimeout(nextButtonTimeout);
  }
  // Start a new debounce timeout
  nextButtonTimeout = setTimeout(() => {
    console.log("Next");
  }, debounceDelay);
});

let reverseButtonPress = reverseButton.on("interrupt", function (level) {
   if (reverseButtonTimeout) {
    clearTimeout(reverseButtonTimeout);
  }
  reverseButtonTimeout = setTimeout(() => {
    console.log("Reverse");
  }, debounceDelay);
});

/* this function displays the pizza that is ready and the pizza being prepared. 
This function should also clear the terminal so that only the current and next pizzas and the input are displayed. */

function displayCurrentAndNextPizzas() { 
if (currentPizzaIndex >= pizzaArray.length) {
    console.log("\nNo more pizzas!\n");
  } else {
    console.log(`\n${pizzaArray[currentPizzaIndex].customerName}'s ${pizzaArray[currentPizzaIndex].pizza} pizza, number ${pizzaArray[currentPizzaIndex].customerNumber}, is ready!\n`);
    if (nextPizzaIndex >= pizzaArray.length) {
      console.log("Next Pizza: None\n");
    } else {
      console.log(`${pizzaArray[nextPizzaIndex].customerName}'s ${pizzaArray[nextPizzaIndex].pizza} pizza, number ${pizzaArray[nextPizzaIndex].customerNumber} is now being prepared.\n`);
    }
  }
} 

 //this function moves the pizza counters up as the pizzas become ready.
function pizzaReady() {
  if (currentPizzaIndex >= pizzaArray.length) {
    console.log("No more pizzas!");
  } else {
    currentPizzaIndex++;
    nextPizzaIndex++;
  }
}

//this function moves the counters back.
function reverseCounters() {
  if (currentPizzaIndex === 0) {
    console.log("\nDu kannst nicht weiter zurückgehen, Dumme.");
  } else {
    currentPizzaIndex--;
    nextPizzaIndex--;
  }
} 

//this function creates a customer object within the pizzaArray
function updateArray(customerName, pizza) {
let customerNumber = uniqueCustomerNumber++
pizzaArray.push({ customerName, pizza, customerNumber });
console.log(`\nThank you, ${customerName}! Your ${pizza} pizza has been added to the list! You are number ${customerNumber}.`);
}

// This function removes customers from the list when inputted with a valid customer number.
function removeCustomer(number) {
  let removedCustomerNumber = parseInt(number);
  let removedCustomerIndex = pizzaArray.findIndex(x => x.customerNumber === removedCustomerNumber) 
  if (isNaN(removedCustomerNumber) || removedCustomerNumber <= 0 || removedCustomerIndex === -1) {
    console.log(`Invalid customer number. Please try again.`);
    displayCurrentAndNextPizzas()
    addCustomer();
  } else {
    let removedCustomer = pizzaArray[removedCustomerIndex];
    rl.question(`Type "yes" to remove ${removedCustomer.customerName}'s ${removedCustomer.pizza} pizza, number ${removedCustomer.customerNumber}. `, (answer) => {
      if (answer.toLowerCase() === "yes") {
        pizzaArray.splice(removedCustomerIndex, 1)
        console.log(`Customer ${removedCustomerNumber} has been removed.`);
      } else {
        console.log(`Customer number ${removedCustomerNumber} was not removed.`);
      }
      displayCurrentAndNextPizzas();
      addCustomer();
    })
  }
};



/* This function uses readline to allow users to input their names and pizza preferences.
It is recursive until stopped by typing stop into the name prompt.
Typing log into the name prompt will display the entire pizza array.
Typing next into the name prompt will increase the value of currentPizzaIndex and nextPizzaIndex by one (at some point I plan to replace this with a physical button).*/
function addCustomer() {
  rl.question('Please enter your name: ', (customerName) => {
    if (customerName.toLowerCase() === "stop") {
      return rl.close();
    } else if (customerName.toLowerCase() === "log") {
      console.log(pizzaArray)
      addCustomer()
    } else if (customerName.toLowerCase() === "next" || nextButtonPress) {
      pizzaReady()
      displayCurrentAndNextPizzas();
      addCustomer()
    } else if (customerName.toLowerCase() === "reverse" || reverseButtonPress) {
      reverseCounters()
      displayCurrentAndNextPizzas();
      addCustomer()
    } else if (customerName.toLowerCase() === "remove") {
      rl.question(`\nPlease enter the customer number: `, (number) => {
        removeCustomer(number)
      })
    } else {
      rl.question(`\nWhat pizza would you like ${customerName}? `, (pizza) => {
        updateArray(customerName, pizza)
        displayCurrentAndNextPizzas();
        addCustomer();
      });
    }
  });
}

    addCustomer()//this calls the function for the first time.

//this listens for the code ending and when it does it saves the pizza array to a .json
process.on("SIGINT", function () {
  console.log("\nExiting");
  const data = JSON.stringify(pizzaArray);
  fs.writeFileSync('pizza-orders.json', data);
  console.log("Pizza orders saved to file!");
  process.exit();
});