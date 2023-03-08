/* things to add and sort out:
* you need to add a way to move the counters back if the button gets accidentally pressed.
* you need to add a way to remove people from the array
* you need too sort out how the display current pizza and the pizza ready functions interact when there is 
only one pizza at the beginning */ 


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
    console.log(`\n${pizzaArray[currentPizzaIndex].name}'s ${pizzaArray[currentPizzaIndex].pizza} pizza, number ${currentPizzaIndex}, is ready!\n`);
    if (nextPizzaIndex >= pizzaArray.length) {
      console.log("Next Pizza: None\n");
    } else {
      console.log(`${pizzaArray[nextPizzaIndex].name}'s ${pizzaArray[nextPizzaIndex].pizza} pizza, number ${nextPizzaIndex} is now being prepared.\n`);
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

/* This function uses readline to allow users to input their names and pizza preferences.
It is recursive until stopped by typing stop into the name prompt.
Typing log into the name prompt will display the entire pizza array.
Typing next into the name prompt will increase the value of currentPizzaIndex and nextPizzaIndex by one (at some point I plan to replace this with a physical button).*/
function addCustomer() {
  rl.question('Please enter your name: ', (name) => {
    if (name.toLowerCase() === "stop") {
      return rl.close();
    } else if (name.toLowerCase() === "log") {
      console.log(pizzaArray)
      addCustomer()
    } else if (name.toLowerCase() === "next") {
      pizzaReady()
      displayCurrentAndNextPizzas();
      addCustomer()
    } else {
      rl.question(`\nWhat pizza would you like ${name}? ` , (pizza) => {
        pizzaArray.push({ name, pizza });
        console.log(`\nThank you, ${name}! Your ${pizza} pizza has been added to the list!`);
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
