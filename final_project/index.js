//index.js
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const isValid = require('./router/auth_users.js').isValid; // Import the isValid function

const app = express();

app.use(express.json());

app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

app.use("/customer/auth/*", function auth(req, res, next) {
    // Retrieve the token from the session
    const token = req.session.token;

    // If no token is found, return an unauthorized error
    if (!token) {
        return res.status(401).json({ message: "Unauthorized access. Please log in." });
    }

    // Verify the token
    jwt.verify(token, "secret_key", (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token." });
        }

        // If token is valid, check if the user exists
        const username = decoded.username;
        if (!isValid(username)) {
            return res.status(403).json({ message: "Unauthorized user." });
        }

        // If everything is fine, proceed to the next middleware or route
        next();
    });
});

const PORT = 8080;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
