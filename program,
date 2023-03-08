const readline = require('readline');
const fs = require('fs');

const pizzaArray = [];
let currentPizzaIndex = 0;
let nextPizzaIndex = 0;

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

function addCustomer() {
  rl.question('Please enter your name: ', (name) => {
    if (name.toLowerCase() === "stop") {
      return rl.close();
    } else if (name.toLowerCase() === "log") {
      console.log(pizzaArray)
      addCustomer()
    } else if (name.toLowerCase() === "next") {
      if (currentPizzaIndex >= pizzaArray.length) {
        console.log("No more pizzas!");
      } else {
        console.log(`${pizzaArray[currentPizzaIndex].name}'s ${pizzaArray[currentPizzaIndex].pizza} pizza is ready!`);
        currentPizzaIndex++;
        if (currentPizzaIndex >= pizzaArray.length) {
          console.log("No more pizzas!");
        } else {
          if (nextPizzaIndex >= pizzaArray.length - 1) {
            console.log("Next Pizza: None");
          } else {
            nextPizzaIndex = currentPizzaIndex + 1;
            console.log(`${pizzaArray[nextPizzaIndex].name}'s ${pizzaArray[nextPizzaIndex].pizza} pizza is now being prepared.`);
          }
        }
      }
      displayCurrentAndNextPizzas();
      addCustomer()
    } else {
      rl.question(`What pizza would you like ${name}? ` , (pizza) => {
        pizzaArray.push({ name, pizza });
        console.log(`Thank you, ${name}! Your ${pizza} pizza has been added to the list!`);
        displayCurrentAndNextPizzas();
        if (pizzaArray.length === 1) {
          console.log(`The current pizza being prepared is ${pizzaArray[0].pizza}`);
        } else if (currentPizzaIndex === nextPizzaIndex) {
          nextPizzaIndex++;
          console.log(`${pizzaArray[nextPizzaIndex].name}'s ${pizzaArray[nextPizzaIndex].pizza} pizza is now being prepared.`);
        }
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
