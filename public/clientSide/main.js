//main.js:
const e = require("express");


/* TOKEN DYNAMICS */

// This function checks if a user is logged in by verifying the presence of a token in sessionStorage.
function redirectToUserPageIfLoggedIn() {
    // Retrieve the token from sessionStorage.
    let token = sessionStorage.getItem('token');
    // Check if a token exists and if the current page is the login page.
    if (token && window.location.pathname.endsWith('/login.html')) {
        // If a token exists and the current page is the login page, redirect the user to the user page.
        window.location.href = "userPage.html";
    }
}

// Add an event listener to execute the redirectToUserPageIfLoggedIn function when the DOM content is loaded.
document.addEventListener('DOMContentLoaded', redirectToUserPageIfLoggedIn);




// This asynchronous function verifies the validity of a token by sending it to the server for verification.
async function verifyToken(token) {
    try {
        // Send a POST request to the server with the token for verification.
        let response = await fetch('/verify-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        });
        // If the response is successful (status code 200), return true.
        if (response.ok) {
            return true;
        } else {
            // If the response is not successful, return false.
            return false;
        }
    } catch (error) {
        // If an error occurs during the request, log the error and return false.
        console.error('Error during token verification:', error);
        return false;
    }
}


//FUNCTION FOR THE LOGIN OF THE USER
// This function handles the login process for the user.
function login() {
    // Add an event listener to the login form to handle form submission.
    document.getElementById('loginForm').addEventListener('submit', function(event) {
        // Prevent the default form submission behavior.
        event.preventDefault();

        // Retrieve the email and password values from the form.
        const email = document.querySelector("#emailValue").value;
        const password = document.querySelector("#passValue").value;

        // Send an AJAX request to the server for user authentication.
        $.ajax({
            url: 'http://localhost:3000/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ email: email, password: password }),

            success: function(data) {
                // If authentication is successful, save the JWT token and session data in sessionStorage.
                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('name', data.name);
                sessionStorage.setItem('surname', data.surname);
                sessionStorage.setItem('address', data.address);
                sessionStorage.setItem('email', data.email);
                sessionStorage.setItem('password', data.password);

                // Redirect the user based on their role or other criteria.
                if (data.name === 'admin') {
                    document.location.href = 'admin.html'; // Redirect to admin page for admins.
                } else {
                    document.location.href = data.redirect; // Redirect to the specified page.
                }
            },

            error: function() {
                // If there's an error during login, display an error message to the user.
                const loginError = document.querySelector('#noUser');
                if (loginError) {
                    loginError.innerText = 'Wrong data'; // Display a specific error message.
                    loginError.style.display = 'block'; // Make the error message visible.
                } else {
                    error.style.display = 'none'; // Hide the error element if there are no errors.
                }
            }
        });
    });
}



// This function handles the registration process for new users.
function register() {
    // Add an event listener to the registration form to handle form submission.
    document.getElementById('registerForm').addEventListener('submit', function(event){
        // Prevent the default form submission behavior.
        event.preventDefault();
    
        // Retrieve user input values from the registration form.
        const name = document.querySelector("#name").value;
        const surname = document.querySelector("#surname").value;
        const address = document.querySelector("#address").value;
        const birthDate = document.querySelector("#birthDate").value;
        const email = document.querySelector("#email").value;
        const password = document.querySelector("#password").value;

        // Send an AJAX request to the server for user registration.
        $.ajax({
            url: 'http://localhost:3000/register',
            method: 'POST',
            contentType: 'application/json',
            // Pass user registration data as JSON in the request body.
            data: JSON.stringify({ name: name, surname: surname, address: address, birthDate: birthDate, email: email, password: password }),

            success: function(data) {
                // If registration is successful, redirect the user to the specified page.
                document.location.href = data.redirect;
            },

            error: function() {
                // If there's an error during registration, display an error message to the user.
                const regError = document.querySelector('#alreadyExists');
                if (regError) {
                    regError.innerText = "User already Exists"; // Display a specific error message.
                    regError.style.display = "block"; // Make the error message visible.
                }
            }
        });
    });
}



// This function updates the welcome text on the page based on the user's name stored in sessionStorage.
function changeWelcomeText() {
    // Retrieve the welcome text element from the DOM.
    const text = document.getElementById('welcomeText');

    // Check if the welcome text element exists.
    if (text) {
        // Retrieve the user's name from sessionStorage.
        currentName = sessionStorage.getItem('name');
        
        // Update the welcome text to greet the user by name.
        text.innerText = "Welcome Back " + currentName;
    }
}

          
// This function loads products from the server based on the specified gender and category.
function loadProducts(gender, category) {
    // Send an AJAX request to the server to fetch products.
    $.ajax({
        url: 'http://localhost:3000/products',
        method: 'GET',
        data: { gender: gender, category: category }, // Include parameters for gender and category.

        success: function (data) {
            // Get the product section element from the DOM where products will be displayed.
            const productSection = document.querySelector('.product-section');

            // Loop through each product in the retrieved data.
            data.forEach(product => {
                // Create a new div element for each product.
                let newProduct = document.createElement('div');
                newProduct.classList.add('product');

                // Set the dataset id attribute of the product div to the product id.
                newProduct.dataset.id = product.id;

                // Populate the inner HTML of the product div with product information.
                newProduct.innerHTML =
                    `<div class="img-prod-container">
                        <a href="singleProduct.html?id=${product.id}" class="chosen">
                            <img src="${product.img}" class="product-image">
                        </a>
                    </div>
                    <a href="singleProduct.html?id=${product.id}" class="chosen"><p class="h3">${product.name}</p></a>
                    <h4>€${product.price}</h4>
                    </div>`;

                // Append the new product div to the product section.
                productSection.appendChild(newProduct);
            });
        },

        error: function(){
            // Display an alert if there is an error fetching products.
            alert("Error");
        }
    });
}




// This function handles the logout process for the user.
function logout() {
    // Remove the token from sessionStorage.
    sessionStorage.removeItem('token');

    // Remove user information from sessionStorage.
    sessionStorage.removeItem('name');
    sessionStorage.removeItem('surname');
    sessionStorage.removeItem('address');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('password');

    // Redirect the user to the login page.
    window.location.href = 'login.html';
}

// Add an event listener to the logout button to trigger the logout function when clicked.
document.getElementById('logoutButton').addEventListener('click', logout);





let token = localStorage.getItem('token');
fetch('someProtectedRoute', {
    headers: {
        'Authorization': 'Bearer ' + token
    }
})

// This function loads and displays details of a single product on the page.
function loadSingleProduct(productId){
    // Send an AJAX request to fetch details of the specified product.
    $.ajax({
        url: `http://localhost:3000/singleProduct?id=${productId}`,
        method: 'GET',

        success: function(data){
            // Get the section where product details will be displayed.
            let section = document.querySelector('#prodetails');

            // Create a div to display the main product image.
            let proImg = document.createElement('div');
            proImg.classList.add('single-pro-image');
            proImg.innerHTML = `
                <img src="${data.img}" width="100%" id="MainImg" alt="take1">
            `;
            section.appendChild(proImg);

            // Create a div to display smaller images of the product.
            let small_imgs = document.createElement('div');
            small_imgs.classList.add('small-img-group');
            proImg.appendChild(small_imgs);

            // Add smaller images to the small image group.
            for (let i = 0; i < 4; i++) {
                let smImgCol = document.createElement('div');
                smImgCol.classList.add('small-img-col');
                smImgCol.innerHTML = `
                    <img src="${data.img}" width="100%" class="small-img" alt="">
                `;
                small_imgs.appendChild(smImgCol);
            }

            // Create a div to display product details.
            let proDet = document.createElement('div');
            proDet.classList.add('single-pro-details');
            proDet.dataset.id = data.id;
            proDet.innerHTML = `
                <h6>${data.gender}/${data.category}</h6> 
                <h4>${data.name}</h4>
                <h2>€${data.price}</h2>

                <select id="prodSize">
                    <option>Select Size</option>
                    <option>XL</option>
                    <option>L</option>
                    <option>M</option>
                    <option>S</option>
                </select>

                <button class="addCart" onclick="addToCart(event)">Add To Cart</button>
                <p id="cartError"></p>            

                <h4>Description</h4>
                <span>${data.description}</span>
            `;

            // Append the product details to the section.
            section.appendChild(proDet);

            // Add event listeners to the smaller images to change the main image when clicked.
            const smallImages = document.querySelectorAll('.small-img');
            smallImages.forEach(img => {
                img.addEventListener('click', function() {
                    const mainImage = document.getElementById('MainImg');
                    mainImage.src = this.src;
                });
            });
        },
        
        error: function(){
            // Display an alert if there is an error fetching product details.
            alert("Product Quantity is over, we'll inform you as soon as possible");
        }
    })
}





// This function adds a product to the cart.
function addToCart(event) {
    // Find the closest product details container based on the clicked button.
    let productDetails = event.target.closest('.single-pro-details');
    // Retrieve the product ID from the dataset of the product details container.
    let productId = productDetails.dataset.id;

    // Send an AJAX request to add the product to the cart.
    $.ajax({
        url: `http://localhost:3000/singleProduct?id=${productId}`,
        method: 'POST',
        contentType: 'application/json',
        // Include the product ID and user email in the request body.
        data: JSON.stringify({ id: productId, email: sessionStorage.getItem('email') }),

        success: function(cartItems) {
            // Retrieve elements for updating cart display.
            let iconCartSpan = document.querySelector(".quantity-navbar");
            let listCartHTML = document.querySelector('.listCart');
            let subTotContainer = document.querySelector(".subTotal");

            // Clear the cart display before updating.
            listCartHTML.innerHTML = '';
            let totalQuantity = 0;
            let newSubTotal = 0;

            // Iterate through cart items returned from the server.
            cartItems.forEach(item => {
                totalQuantity += item.quantity;
                newSubTotal += item.price * item.quantity;
                // Check if the item is already in the cart.
                let existingCartItem = document.querySelector(`.item[data-id='${item.id}']`);

                // Update quantity if item is already in the cart, otherwise add a new cart item.
                if (existingCartItem) {
                    let quantitySpan = existingCartItem.querySelector('.quantity span:nth-child(2)');
                    quantitySpan.textContent = item.quantity; // Update with exact quantity returned from server
                } else {
                    // Create a new cart item element.
                    let cartDiv = document.createElement('div');
                    cartDiv.classList.add('item');
                    cartDiv.setAttribute('data-id', item.id);
                    cartDiv.innerHTML = `
                        <div class="image">
                            <img src="${item.img}" alt="${item.name}">
                        </div>
                        <div class="name">${item.name}</div>
                        <div class="totalPrice">€${item.price}</div>
                        <div class="quantity">
                            <span class="minus">QNT:</span>
                            <span>${item.quantity}</span>
                            <span class="plus"></span>
                        </div>
                    `;
                    listCartHTML.appendChild(cartDiv);
                }
            });

            // Update localStorage with the latest cart items.
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            // Update the cart icon quantity display.
            iconCartSpan.innerText = totalQuantity;
            // Update the subtotal display.
            subTotContainer.innerHTML = "SUB TOTAL: €" + newSubTotal;
        },

        error: function() {
            // Display an alert if there is an error adding the product to the cart.
            alert("u must be logged into your account to add products");
        }
    });
}





// This function loads the user's cart and displays it on the check out page.
function loadUserCart(userMail) {
    // Check if userMail is not provided.
    if (!userMail) {
        alert("Error: User email not provided");
        return;
    }

    // Send an AJAX request to fetch the user's cart data.
    $.ajax({
        url: `http://localhost:3000/cart?email=${encodeURIComponent(userMail)}`,
        method: 'GET',

        success: function(cart) {
            // Initialize variables for total cost and shipping cost.
            let total = 0;
            let shippingCost = 0;

            // Get the cart section element from the DOM.
            const cartSection = document.querySelector('.cart');

            // Create a table element to display the cart.
            const cartTable = document.createElement('table');
            cartTable.classList.add('cart');
            cartTable.innerHTML = 
                `
                    <thead>
                        <tr>
                            <td>ID</td>
                            <td>Product</td>
                            <td>Price</td>
                            <td>Quantity</td>
                            <td>Remove</td>                   
                        </tr>
                    </thead>
                    <tbody id="bodyTable">
                    </tbody> 
                `;

            // Clear the cart section and add the table.
            cartSection.innerHTML = '';
            cartSection.appendChild(cartTable);

            // Get the table body.
            const tableBody = cartTable.querySelector('tbody');

            // Get containers for displaying total, shipping cost, and final total.
            let totalContainer = document.querySelector('#totalOfCart');
            let shippingContainer = document.querySelector("#shCosts");
            let finalContainer = document.querySelector('#total');

            // Iterate through each item in the cart.
            cart.forEach(item => {
                // Create a table row for each item.
                const row = document.createElement('tr');
                row.dataset.productId = item.id;
                row.innerHTML = `
                    <td><img src="${item.img}"></td>
                    <td>${item.name}</td>
                    <td>€${item.price * item.quantity}</td>
                    <td>${item.quantity}</td>
                    <td class="trashBin"><button onclick="removeItem(event)" style="border:none; background-color:white;"><i class="fa-solid fa-trash-can"></button></i></td>
                `;
                tableBody.appendChild(row);
                // Update the total cost.
                total += item.price * item.quantity;
            });

            // Update localStorage with the latest cart items.
            localStorage.setItem('cartItems', JSON.stringify(cart));

            // Display the total cost.
            totalContainer.innerHTML = '€' + total;

            // Calculate shipping cost based on total cost.
            if (total > 50) {
                shippingCost = 4;
            } else {
                shippingCost = 0;
            }

            // Display the shipping cost.
            shippingContainer.innerHTML = '€' + shippingCost;

            // Display the final total including shipping.
            finalContainer.innerHTML = '€' + (total + shippingCost);
        },

        error: function() {
            // Display an alert if there is an error fetching the user's cart data.
            alert("Error: Unable to load user's cart");
        }
    });
}



// This function removes an item from the user's cart.
function removeItem(event) {
    // Find the closest table row containing the remove button that was clicked.
    const row = event.target.closest('tr');
    // Get the product ID from the dataset of the table row.
    const productId = row.dataset.productId;
    // Get the user's email from sessionStorage.
    const email = sessionStorage.getItem('email');

    // Send an AJAX request to remove the item from the cart.
    $.ajax({
        url: 'http://localhost:3000/cart',
        method: 'POST',
        contentType: 'application/json',
        // Pass the product ID and user email in the request body.
        data: JSON.stringify({ id: productId, email: email }),

        success: function() {
            // Reload the page after successful removal.
            location.reload();
        },
        error: function() {
            // Display an alert if there is an error removing the product from the cart.
            alert("Error removing product from cart");
        }
    });
}




// This function is used to load the cart content on other pages of the web app.
function loadCartContent(email) {
    // Check if the user is logged in (email is provided).
    if (email) {
        // Get elements from the DOM.
        let listCartHTML = document.querySelector(".listCart");
        let iconCartSpan = document.querySelector(".quantity-navbar");
        let subTotContainer = document.querySelector(".subTotal");

        // Check if all necessary DOM elements are found.
        if (!listCartHTML || !iconCartSpan || !subTotContainer) {
            console.error("One or more DOM elements not found.");
            return;
        }

        // Clear the cart content.
        listCartHTML.innerHTML = '';
        let totalQuantity = 0;
        let newSubTotal = 0;

        // Retrieve cart items from localStorage.
        let storedCartItems = localStorage.getItem('cartItems');
        if (storedCartItems) {
            let cartItems = JSON.parse(storedCartItems);

            // Iterate through each item in the cart and update total quantity and subtotal.
            cartItems.forEach(item => {
                totalQuantity += item.quantity;
                newSubTotal += item.price * item.quantity;

                // Create a new cart item element and append it to the listCartHTML.
                let newCart = document.createElement('div');
                newCart.classList.add('item');
                newCart.dataset.id = item.product_id;
                newCart.innerHTML = `
                    <div class="image">
                        <img src="${item.img}">
                    </div>
                    <div class="name">
                        ${item.name}
                    </div>
                    <div class="totalPrice">
                        €${item.price}
                    </div>
                    <span>QNT: ${item.quantity}</span>
                `;
                listCartHTML.appendChild(newCart);
            });
        } else {
            console.log("No elements in the cart.");
        }

        // Update the cart icon quantity and subtotal display.
        iconCartSpan.innerText = totalQuantity;
        subTotContainer.innerHTML = "SUB TOTAL: €" + newSubTotal;
    } else {
        console.log("You must be logged in.");
    }
}


//This function shows  the number next to the icon cart to prevent issues with cart content
// This function is used to load the cart content in a specific manner on the single product page.
function loadCartContentV2(email) {
    // Check if the user is logged in (email is provided).
    if (email) {
        // Get the cart icon span element from the DOM.
        let iconCartSpan = document.querySelector(".quantity-navbar");

        // Check if the cart icon span element is found.
        if (!iconCartSpan) {
            console.error("Element .quantity-navbar not found.");
            return;
        }

        let totalQuantity = 0;

        // Retrieve cart items from localStorage.
        let storedCartItems = localStorage.getItem('cartItems');

        // If cart items are found in localStorage, calculate the total quantity.
        if (storedCartItems) {
            let cartItems = JSON.parse(storedCartItems);
            cartItems.forEach(item => {
                totalQuantity += item.quantity;
            });
        } else {
            console.log("No items in the cart.");
        }

        // Update the cart icon span with the total quantity.
        iconCartSpan.innerText = totalQuantity;
    } else {
        console.log("You must be logged in.");
    }
}














