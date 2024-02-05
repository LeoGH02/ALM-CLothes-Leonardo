// Importing required modules
const express = require("express");
const app = express();
const port = 3000; // Port on which the server will listen
const fs = require("fs");
const path = require('path');
const bcrypt = require('bcrypt'); // For hashing passwords
const jwt = require('jsonwebtoken'); // For handling JSON Web Tokens
const secretKey = "CaldoCotton"; // Secret key used for signing JWTs

// Path to the JSON file for database
const jsonFilePath = path.join(__dirname,'database.json')

// Important: Using bodyParser to parse request body data
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serving static files from the 'public' directory
app.use(express.static('public'));






// Endpoint for handling login requests
//For login form
app.post("/login", (req, res) => {
    // Extracting email and password from request body
    const email = req.body.email;
    const password = req.body.password;

    // Reading the JSON file containing user data
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        // Handling file read errors
        if (err) {
            res.status(500).send("Error reading file");
            return;
        }
        // Proceeding if data is available
        if (data) {
            try {
                // Parsing JSON data
                const info = JSON.parse(data);
                // Finding user by email
                const checkUser = info.users.find(u => u.email === email);

                // If user exists
                if (checkUser) {
                    // Comparing password hashes
                    bcrypt.compare(password, checkUser.password, function(err, result) {
                        if (result) {
                            // Password matches, create JWT token
                            const token = jwt.sign({ id: checkUser.id, email: checkUser.email }, secretKey, { expiresIn: '1h' });

                            // Sending user data and token to client
                            res.json({
                                token,
                                id: checkUser.id,
                                name: checkUser.name,
                                surname: checkUser.surname,
                                address: checkUser.address,
                                birthDate: checkUser.birthDate,
                                email: checkUser.email,
                                redirect: 'index.html' // Redirect URL after successful login
                            });
                        } else {
                            // Password does not match
                            res.status(401).send({ error: "Incorrect email or password" }); 
                        }
                    });
                } else {
                    // User not found
                    res.status(401).send({ error: "Incorrect email or password" }); 
                }
            } catch (parseError) {
                // Error parsing credentials
                res.status(500).send("Error parsing credentials");
            }
        } else {
            // Empty JSON file
            res.status(500).send("Empty JSON file");
        }
    });
});





// Number of salt rounds for bcrypt hashing
const saltRounds = 10; // You can adjust the salt rounds as needed

// Endpoint for handling user registration
app.post("/register", (req, res) => {
    // Extracting user data from request body
    const name = req.body.name;
    const surname = req.body.surname;
    const address = req.body.address;
    const birthDate = req.body.birthDate;
    const email = req.body.email;
    const password = req.body.password;

    // Checking if all required fields are provided
    if (name.trim() !== '' && surname.trim() !== '' && address.trim() !== '' && birthDate.trim() !== '' && email.trim() !== '' && password.trim() !== '') {
        // Reading user data from JSON file
        fs.readFile(jsonFilePath, 'utf8', (err, data) => {
            if (err) {
                // Handling file read errors
                res.status(500).send("Error while reading file");
                return;
            }

            // Parsing JSON data
            const info = JSON.parse(data);
            // Checking if user already exists
            const checkUser = info.users.find(u => u.email === email);

            // If user does not exist
            if (!checkUser) {
                // Hashing the password before storing
                bcrypt.hash(password, saltRounds, function(err, hash) {
                    if (err) {
                        // Handling bcrypt hashing errors
                        res.status(500).send("Error while hashing the password");
                        return;
                    }

                    // Adding the user with hashed password to the database
                    info.users.push({
                        name: name,
                        surname: surname,
                        address: address,
                        birthDate: birthDate,
                        email: email,
                        password: hash, // Storing the hashed password
                        cart: [] // Initializing an empty shopping cart
                    });

                    // Writing updated user data to JSON file
                    fs.writeFile(jsonFilePath, JSON.stringify(info, null, 2), 'utf8', (err) => {
                        if (err) {
                            // Handling file write errors
                            res.status(500).send("Error while writing to file");
                            return;
                        }
                        // Redirecting user to login page after successful registration
                        res.json({ redirect: 'login.html' });
                    });
                });
            } else {
                // User already exists
                res.status(409).send("User already exists");
            }
        });
    } else {
        // Invalid input if required fields are not provided
        res.status(400).send("Invalid input");
    }
});


// Function to handle GET requests for fetching products
app.get('/products', (req, res) => {
    // Extracting query parameters from request
    const gender = req.query.gender;
    const category = req.query.category;

    // Logging received query parameters
    console.log("Received query params:", { gender, category });

    // Reading data from JSON file
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            // Handling file read errors
            console.error("Error reading file:", err);
            res.status(500).send("Server error");
            return;
        }

        let info;
        try {
            // Parsing JSON data
            info = JSON.parse(data);
        } catch (parseError) {
            // Handling JSON parsing errors
            console.error("Error parsing JSON:", parseError);
            res.status(500).send("Error parsing JSON file");
            return;
        }

        // Ensure that the info object has the 'products' property
        if (!info.products) {
            // Handling missing 'products' property
            console.error("JSON file does not contain 'products' property");
            res.status(500).send("Error in JSON file structure");
            return;
        }

        // Filtering products based on gender and category
        const filteredProducts = info.products.filter(p => p.category === category && p.gender === gender);

        // Logging filtered products
        console.log("Filtered products:", filteredProducts);

        if (filteredProducts.length > 0) {
            // Sending filtered products as response
            res.json(filteredProducts);
        } else {
            // Sending 404 status if no products match the criteria
            res.status(404).send("No products found for the specified criteria");
        }
    });
});



// Function to verify JWT token sent in the request headers
function verifyToken(req, res, next) {
    const token = req.headers['authorization']; // Assume the token is sent in the 'Authorization' header

    // Check if token is missing
    if (!token) {
        return res.status(401).send("Missing token");
    }

    // Verify the token using the secret key
    jwt.verify(token, secretKey, (err, decoded) => {
        // Check if token verification failed
        if (err) {
            return res.status(401).send("Invalid token");
        }

        // Token verified, add user information to the request object
        req.user = decoded;
        next(); // Move to the next middleware or route handler
    });
}

// Use this function as middleware in your protected routes
app.get('/someProtectedRoute', verifyToken, (req, res) => {
    // Access req.user to get user information
});




// Function to provide data for the single product page
app.get("/singleProduct", (req, res) => {
    // Extracting the product ID from the query parameters
    const id = req.query.id;

    // Checking if the product ID is missing
    if (!id) {
        res.status(400).send("Missing product ID");
        return;
    }

    // Reading data from the JSON file
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        // Handling file read errors
        if (err) {
            res.status(500).send("Error while reading file");
            return;
        }

        let info;
        try {
            // Parsing JSON data
            info = JSON.parse(data);
        } catch (parseError) {
            // Handling JSON parsing errors
            console.error("Error while parsing:", parseError);
            res.status(500).send("Error in parsing");
            return;
        }

        // Finding the product with the provided ID
        const checkProduct = info.products.find(p => p.id === id);

        if (checkProduct) {
            // Sending the product data as response
            res.send(checkProduct);
        } else {
            // Sending 404 status if product not found
            res.status(404).send("Product not found");
        }
    });
});


// Function to verify if a user can add items to their cart
app.post('/singleProduct', (req, res) => {
    // Extracting product ID and user email from the request body
    const id = req.body.id;
    const email = req.body.email;

    // Reading data from the JSON file
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        // Handling file read errors
        if (err) {
            res.status(500).send("Error reading the file");
            return;
        }

        let info;
        try {
            // Parsing JSON data
            info = JSON.parse(data);
        } catch (parseError) {
            // Handling JSON parsing errors
            console.error("Error parsing JSON:", parseError);
            res.status(500).send("Error parsing the JSON file");
            return;
        }

        // Finding the product with the provided ID
        const checkProduct = info.products.find(p => p.id === id);
        // Finding the user's cart based on email
        const checkCart = info.users.find(u => u.email === email);

        // If both product and cart exist
        if (checkProduct && checkCart) {
            // Check if the product is in stock
            if (checkProduct.quantityAvailable > 0) {
                // Check if the product is already in the user's cart
                let productInCart = checkCart.cart.find(item => item.id === checkProduct.id);

                if (productInCart) {
                    // Increment the quantity of the product in the cart
                    productInCart.quantity++;
                } else {
                    // Add the product to the user's cart
                    checkCart.cart.push({
                        id: checkProduct.id,
                        name: checkProduct.name,
                        img: checkProduct.img,
                        price: checkProduct.price,
                        quantity: 1
                    });
                }

                // Decrease the available quantity of the product
                checkProduct.quantityAvailable--;

                // Save the changes to the JSON file
                fs.writeFile(jsonFilePath, JSON.stringify(info, null, 2), 'utf8', (writeErr) => {
                    if (writeErr) {
                        res.status(500).send("Error writing the file");
                        return;
                    }
                    // Send the updated user's cart as response
                    res.json(checkCart.cart);
                });
            } else {
                // Send 400 status if the product is out of stock
                res.status(400).send("Product is out of stock");
            }
        } else {
            // Send 400 status if the product or cart is not found
            res.status(400).send("Product or cart not found");
        }
    });
});


// Function to retrieve the content of the cart for a specific user
app.get('/cart', (req, res) => {
    // Extracting user email from the query parameters
    const email = req.query.email;

    // Reading data from the JSON file
    fs.readFile(jsonFilePath, 'utf-8', (err, data) => {
        // Handling file read errors
        if (err) {
            res.status(500).send("Not available");
            return;
        }

        // Parsing JSON data
        const info = JSON.parse(data);

        // Finding the user based on the provided email
        const checkUser = info.users.find(u => u.email === email);

        // If user is found
        if (checkUser) {
            // Send the user's cart as response
            res.json(checkUser.cart);
        } else {
            // Send 404 status if user is not found
            res.status(404).send("User not found");
        }
    });
});

 
// Function to remove a product from the user's cart
app.post('/cart', (req, res) => {
    // Extracting user email and product ID from the request body
    const email = req.body.email;
    const id = req.body.id;

    // Reading data from the JSON file
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        // Handling file read errors
        if (err) {
            return res.status(500).send("Error while reading file");
        }

        // Parsing the JSON data
        const info = JSON.parse(data);

        // Finding the user based on the provided email
        const user = info.users.find(u => u.email === email);

        // Handling case where user is not found
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Finding the index of the product in the user's cart and the quantity of the product
        const productInCartIndex = user.cart.findIndex(item => item.id === id);
        if (productInCartIndex === -1) {
            return res.status(404).send("Product not found in cart");
        }
        const quantityInCart = user.cart[productInCartIndex].quantity;

        // Removing the product from the user's cart
        user.cart.splice(productInCartIndex, 1);

        // Finding the product in the products list and updating its available quantity
        const productInList = info.products.find(p => p.id === id);
        if (productInList) {
            productInList.quantityAvailable += quantityInCart;
        }

        // Overwriting the JSON file while maintaining formatting
        fs.writeFile(jsonFilePath, JSON.stringify(info, null, 2), 'utf8', (err) => {
            // Handling file write errors
            if (err) {
                return res.status(500).send("Error while writing file");
            }
            // Sending success response after removing the product from the cart and updating quantity
            res.send("Product removed from cart and quantity restored");
        });
    });
});


// Start the server and listen on port 3000
app.listen(3000, () => {
    // Log a message to indicate that the server is connected
    console.log("Connected");
});
















