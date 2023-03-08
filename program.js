const readline = require('readline');
const fs = require('fs');

const pizzaArray = [];
let currentPizzaIndex = 0;
let nextPizzaIndex = 1;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function displayCurrentAndNextPizzas() {
  if (currentPizzaIndex >= pizzaArray.length) {
    console.log("No more pizzas!");
  } else {
    console.log(`${pizzaArray[currentPizzaIndex].name}'s ${pizzaArray[currentPizzaIndex].pizza} pizza, number ${currentPizzaIndex}, is ready!`);
    if (nextPizzaIndex >= pizzaArray.length) {
      console.log("Next Pizza: None");
    } else {
      console.log(`${pizzaArray[nextPizzaIndex].name}'s ${pizzaArray[nextPizzaIndex].pizza} pizza, number ${nextPizzaIndex} is now being prepared.`);
    }
  }
}

function pizzaReady() {
  if (currentPizzaIndex >= pizzaArray.length) {
    console.log("No more pizzas!");
  } else {
    currentPizzaIndex++;
    nextPizzaIndex++;
  }
}

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
      rl.question(`What pizza would you like ${name}? ` , (pizza) => {
        pizzaArray.push({ name, pizza });
        console.log(`Thank you, ${name}! Your ${pizza} pizza has been added to the list!`);
        displayCurrentAndNextPizzas();
        addCustomer();
      });
    }
  });
}


addCustomer();

process.on('exit', () => {
  const data = JSON.stringify(pizzaArray);
  fs.writeFileSync('pizza-orders.json', data);
  console.log("Pizza orders saved to file!");
});
