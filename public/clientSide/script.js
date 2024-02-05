
//This is the script for opening the cartTab
// Selecting the <body> element of the HTML document
const body = document.querySelector("body");

// Selecting the element that triggers the opening of the shopping cart
const openShopping = document.querySelector(".shopping");

// Selecting the element that triggers the closing of the shopping cart
const closeShopping = document.querySelector(".closeShopping");

// Adding an event listener to the element that opens the shopping cart
openShopping.addEventListener("click", () => {
    // Adding the "active" class to the <body> element when the shopping cart is opened
    document.body.classList.add("active");
});

// Adding an event listener to the element that closes the shopping cart
closeShopping.addEventListener("click", () => {
    // Removing the "active" class from the <body> element when the shopping cart is closed
    document.body.classList.remove("active");
});


























