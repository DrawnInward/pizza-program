/* Things to do:
 * Test it is working properly, i think there might be a problem with the counters again.
 * Test some more.
 * Make the json at the end save itself to the date/time etc. so it is unique, also make it back itself up, perhaps everytime a pizza is added it is saved.
 * Make a way to convert a json back into a pizza array in case of someone knocking it or something */

const readline = require("readline"); //enables the readline module so that so that we can handle user input line by line.
const fs = require("fs"); //enables the file system module so that the pizzaArray can be saved at the end.
const clear = require('console-clear'); // library used to clear the console.
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
}); // defines an interface that reads input from command line.

//imports pigpio module to handle Gpio pins
const Gpio = require("pigpio").Gpio;

// configures two buttons
const nextButton = new Gpio(17, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_UP,
  edge: Gpio.FALLING_EDGE,
});
const reverseButton = new Gpio(27, {
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

let pizzaArray = [];
let currentPizzaIndex = 0;
let nextPizzaIndex = 1;
let uniqueCustomerNumber = 1;


// these will be used to assign a date to the backup of the pizzaArray
const today = new Date();
const dateString = today.toISOString().slice(0, 10); // get ISO date format -- yyyy-mm-dd


// this function creates a backup of the pizzaArray with the date attached
function backupPizzaArray() {
  const filename = `pizza-orders-${dateString}.json`; // create filename with date
  const data = JSON.stringify(pizzaArray);
  fs.writeFileSync(filename, data);
}

function restorePizzaArray() {
  rl.question("Restore pizzaArray from which date? (yyyy-mm-dd) ", (date) => {
  fs.readFile(`pizza-orders-${date}.json`, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    pizzaArray = JSON.parse(data); // parses the data and assign it to the pizzaArray
    console.log(pizzaArray)
  });
});
}


// this function displays the pizza that is ready and the pizza being prepared.

function displayCurrentAndNextPizzas() {
  if (currentPizzaIndex >= pizzaArray.length) {
    console.log("\nNo more pizzas!\n");
  } else {
    clear(true)
    console.log(
      `\n${pizzaArray[currentPizzaIndex].customerName}'s ${pizzaArray[currentPizzaIndex].pizza} pizza, number ${pizzaArray[currentPizzaIndex].customerNumber}, is ready!\n`
    );
    if (nextPizzaIndex >= pizzaArray.length) {
      console.log("Next Pizza: None\n");
    } else {
      console.log(
        `${pizzaArray[nextPizzaIndex].customerName}'s ${pizzaArray[nextPizzaIndex].pizza} pizza, number ${pizzaArray[nextPizzaIndex].customerNumber} is now being prepared.\n`
      );
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
  let customerNumber = uniqueCustomerNumber++;
  pizzaArray.push({ customerName, pizza, customerNumber });
  console.log(
    `\nThank you, ${customerName}! Your ${pizza} pizza has been added to the list! You are number ${customerNumber}.`
  );
  backupPizzaArray();
}

// This function removes customers from the list when inputted with a valid customer number.
function removeCustomer(number) {
  let removedCustomerNumber = parseInt(number);
  let removedCustomerIndex = pizzaArray.findIndex(
    (x) => x.customerNumber === removedCustomerNumber
  );
  if (
    isNaN(removedCustomerNumber) ||
    removedCustomerNumber <= 0 ||
    removedCustomerIndex === -1
  ) {
    console.log(`Invalid customer number. Please try again.`);
    displayCurrentAndNextPizzas();
    addCustomer();
  } else {
    let removedCustomer = pizzaArray[removedCustomerIndex];
    rl.question(
      `Type "yes" to remove ${removedCustomer.customerName}'s ${removedCustomer.pizza} pizza, number ${removedCustomer.customerNumber}. `,
      (answer) => {
        if (answer.toLowerCase() === "yes") {
          pizzaArray.splice(removedCustomerIndex, 1);
          console.log(`Customer ${removedCustomerNumber} has been removed.`);
        } else {
          console.log(
            `Customer number ${removedCustomerNumber} was not removed.`
          );
        }
        displayCurrentAndNextPizzas();
        backupPizzaArray()
        addCustomer();
      }
    );
  }
}

/* This function uses readline to allow users to input their names and pizza preferences.
Typing log into the name prompt will display the entire pizza array.
Typing next into the name prompt will increase the value of currentPizzaIndex 
and nextPizzaIndex by one. This can also be done with the two buttons. */

function addCustomer() {
  rl.question("Please enter your name: ", (customerName) => {
    if (customerName.toLowerCase() === "log") {
      console.log(pizzaArray);
      addCustomer();
    } else if (customerName.toLowerCase() === "next") {
      pizzaReady();
      displayCurrentAndNextPizzas();
      addCustomer();
    } else if (customerName.toLowerCase() === "reverse") {
      reverseCounters();
      displayCurrentAndNextPizzas();
      addCustomer();
    } else if (customerName.toLowerCase() === "remove") {
      rl.question(`\nPlease enter the customer number: `, (number) => {
        removeCustomer(number);
      });
    } else if (customerName.toLowerCase() === "restorepizzaarray") {
      restorePizzaArray()
      addCustomer()
    } else {
      rl.question(`\nWhat pizza would you like ${customerName}? `, (pizza) => {
        displayCurrentAndNextPizzas();
        updateArray(customerName, pizza);
        addCustomer();
      });
    }
  });
}

// defines that the buttons, upon interrupt, call the applicable functions. Also implements the debounce deley.

nextButton.on("interrupt", function (level) {
  // Check if the debounce timeout is still running
  if (nextButtonTimeout) {
    clearTimeout(nextButtonTimeout);
  }
  // Start a new debounce timeout
  nextButtonTimeout = setTimeout(() => {
    pizzaReady();
    displayCurrentAndNextPizzas();
    addCustomer();
  }, debounceDelay);
});

reverseButton.on("interrupt", function (level) {
  if (reverseButtonTimeout) {
    clearTimeout(reverseButtonTimeout);
  }
  reverseButtonTimeout = setTimeout(() => {
    reverseCounters();
    displayCurrentAndNextPizzas();
    addCustomer();
  }, debounceDelay);
});

addCustomer(); //this calls the function for the first time and begins the cycle.

//this listens for the code ending and when it does it saves the pizza array to a .json
process.on("SIGINT", function () {
  console.log("\nExiting");
  process.exit();
});
