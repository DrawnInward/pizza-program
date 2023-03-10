/* things to add and sort out:
* you need to fix the remove function so that it works with the current and next index's. Current problems are that the pizza counters are counting through the index's not the customer numbers, so it displays pizzas that have already been removed. Also new pizzas are assigned the same customer numbers because the array length gets shorter. Maybe use delete instead of splice? (doesn't work, maybe can't iterate properly over undefined element in array).
* you need too sort out how the display current pizza and the pizza ready functions interact when there is 
only one pizza at the beginning add order numbers to pizza array */ 


const readline = require('readline'); //enables the readline module so that so that we can handle user input line by line.
const fs = require('fs'); //enables the file system module so that the pizzaArray can be saved at the end. 
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
}); // defines an interface that read input from command line.

const pizzaArray = [];
let currentPizzaIndex = 0;
let nextPizzaIndex = 1;

// this function displays the pizza that is ready and the pizza being prepared. This function should also clear the terminal so that only the cirrent and next pizzas and the input are displayed.
function displayCurrentAndNextPizzas() { 
if (currentPizzaIndex >= pizzaArray.length) {
    console.log("\nNo more pizzas!\n");
  } else {
    console.log(`\n${pizzaArray[currentPizzaIndex].customerName}'s ${pizzaArray[currentPizzaIndex].pizza} pizza, number ${currentPizzaIndex + 1}, is ready!\n`);
    if (nextPizzaIndex >= pizzaArray.length) {
      console.log("Next Pizza: None\n");
    } else {
      console.log(`${pizzaArray[nextPizzaIndex].customerName}'s ${pizzaArray[nextPizzaIndex].pizza} pizza, number ${nextPizzaIndex + 1} is now being prepared.\n`);
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

function reverseCounters() {
  if (currentPizzaIndex === 0) {
    console.log("\nDu kannst nicht weiter zurückgehen, Dumme.");
  } else {
    currentPizzaIndex--;
    nextPizzaIndex--;
  }
} 

function updateArray(customerName, pizza) {
let customerNumber = pizzaArray.length + 1
pizzaArray.push({ customerName, pizza, customerNumber });
console.log(`\nThank you, ${customerName}! Your ${pizza} pizza has been added to the list! You are number ${customerNumber}.`);
}

// Current problems are that the pizza counters are counting through the index's not the customer numbers, so it displays pizzas that have already been removed. Also new pizzas are assigned the same customer numbers because the array length gets shorter. Maybe use delete instead of splice? (doesn't work, maybe can't iterate properly over undefined element in array).
const removeCustomer = (customerNumber) => {
  const index = pizzaArray.findIndex(x => x.customerNumber === customerNumber);
  if (index !== -1) {
    delete pizzaArray.splice(index, 1);
    console.log(`Customer ${customerNumber} has been removed.`);
  } else {
    console.log(`No customer with number ${customerNumber} was found.`);
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
    } else if (customerName.toLowerCase() === "next") {
      pizzaReady()
      displayCurrentAndNextPizzas();
      addCustomer()
    } else if (customerName.toLowerCase() === "reverse") {
      reverseCounters()
      displayCurrentAndNextPizzas();
      addCustomer()
    } else if (customerName.toLowerCase() === "remove") {
      rl.question(`\nPlease enter the customer number: `, (number) => {
        let customerNumber = parseInt(number);
        if (isNaN(customerNumber) || customerNumber <= 0 || customerNumber > pizzaArray.length) {
          console.log(`Invalid customer number. Please try again.`);
          addCustomer();
        } else {
          let removedCustomer = pizzaArray[pizzaArray.findIndex(x => x.customerNumber === customerNumber)];
          rl.question(`Type "yes" to remove ${removedCustomer.customerName}'s ${removedCustomer.pizza} pizza, number ${removedCustomer.customerNumber}. `, (answer) => {
            if (answer.toLowerCase() === "yes") {
              removeCustomer(customerNumber);
            } else {
              console.log(`Customer ${customerNumber} was not removed.`);
            }
            addCustomer();
          });
        }
      });
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
process.on('exit', () => {
  const data = JSON.stringify(pizzaArray);
  fs.writeFileSync('pizza-orders.json', data);
  console.log("Pizza orders saved to file!");
});
