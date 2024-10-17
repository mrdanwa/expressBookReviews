//router/auth_users.js
const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if the username is valid (for example, it shouldn't be empty or too short)
const isValid = (username) => {
  return typeof username === 'string' && username.trim().length > 0;
}

// Check if the username and password match an existing user
const authenticatedUser = (username, password) => {
  const user = users.find(user => user.username === username && user.password === password);
  return !!user; // Return true if user is found and password matches
}


//only registered users can login
regd_users.post("/login", (req, res) => {
  // Get username and password from the request body
  const { username, password } = req.body;

  // Check if both username and password are provided and valid
  if (!isValid(username) || !password) {
    return res.status(400).json({ message: "Username and password are required and must be valid." });
  }

  // Authenticate the user
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  // If valid, generate a JWT token
  const token = jwt.sign({ username }, "secret_key", { expiresIn: '1h' });

  // Save the token and password in the session
  req.session.token = token;
  req.session.password = password;  // Storing password for validation in middleware (alternative could be user_id)
  req.session.username = username;  

  // Return a success message along with the token
  return res.status(200).json({ message: "Login successful", token: token });
});



// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Get the ISBN from the request parameters
  const isbn = req.params.isbn;

  // Check if the book exists
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }

  // Get the review from the request body
  const { review } = req.body;

  // Check if the review is provided
  if (!review) {
    return res.status(400).json({ message: "Review is required." });
  }

  // Get the username from the session (assuming the user is logged in and session stores the username)
  const username = req.session.username;

  // Check if the username is present in the session
  if (!username) {
    return res.status(401).json({ message: "Unauthorized. Please log in to post a review." });
  }

  // If the user already posted a review for this ISBN, modify it, otherwise add a new review
  if (!book.reviews) {
    book.reviews = {}; // Ensure the reviews object exists
  }

  // Add or update the user's review
  book.reviews[username] = review;

  // Return a success message
  return res.status(200).json({ message: `Review for book with ISBN ${isbn} has been added/modified successfully.` });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  // Get the ISBN from the request parameters
  const isbn = req.params.isbn;

  // Check if the book exists
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }

  // Retrieve the username from the session
  const username = req.session.username;

  // Check if the username is present in the session
  if (!username) {
    return res.status(401).json({ message: "Unauthorized. Please log in to delete your review." });
  }

  // Check if the user has a review for this book
  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: `No review found for book with ISBN ${isbn} by user ${username}.` });
  }

  // Delete the user's review
  delete book.reviews[username];

  // Return a success message
  return res.status(200).json({ message: `Review for book with ISBN ${isbn} by user ${username} has been deleted.` });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
