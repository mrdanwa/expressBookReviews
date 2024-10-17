const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Register a new user
public_users.post("/register", (req, res) => {
  // Get username and password from the request body
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check if the username already exists
  const userExists = users.some(user => user.username === username);

  if (userExists) {
    return res.status(400).json({ message: "Username already exists." });
  }

  // Register the new user
  users.push({ username, password });

  // Return success message
  return res.status(200).json({ message: "User successfully registered." });
});


// Get the book list available in the shop
/*
public_users.get('/',function (req, res) {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});
  return res.send(JSON.stringify(books,null,4));
});
*/
public_users.get('/', function (req, res) {
  new Promise((resolve, reject) => {
      // Simulate asynchronous behavior with local data
      resolve(books);
  })
  .then((booksData) => {
      res.send(JSON.stringify(booksData, null, 4));
  })
  .catch((error) => {
      res.status(500).json({ message: "Error fetching books." });
  });
});

// Get book details based on ISBN
/*
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.send(JSON.stringify(book,null,4));
  } else {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }
 });
*/
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
          resolve(book);
      } else {
          reject("Book not found");
      }
  })
  .then((bookData) => {
      res.send(JSON.stringify(bookData, null, 4));
  })
  .catch((error) => {
      res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  });
});

// Get book details based on author
/*
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});
   // Retrieve the author from the request parameters
  const author = req.params.author.toLowerCase();

  // Get all keys (ISBNs) from the 'books' object
  const bookKeys = Object.keys(books);

  // Create an array to store books written by the matching author
  let matchingBooks = [];

  // Iterate through the 'books' object and check for matching authors
  bookKeys.forEach((isbn) => {
    if (books[isbn].author.toLowerCase() === author) {
      matchingBooks.push(books[isbn]);
    }
  });

  // If there are matching books, return them
  if (matchingBooks.length > 0) {
    return res.send(JSON.stringify(matchingBooks,null,4));
  } else {
    // If no books are found, return a 404 error
    return res.status(404).json({ message: `No books found for author ${req.params.author}` });
  }
});
*/
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();

  new Promise((resolve, reject) => {
      const bookKeys = Object.keys(books);
      let matchingBooks = [];

      // Find books by author
      bookKeys.forEach((isbn) => {
          if (books[isbn].author.toLowerCase() === author) {
              matchingBooks.push(books[isbn]);
          }
      });

      if (matchingBooks.length > 0) {
          resolve(matchingBooks);
      } else {
          reject("No books found for this author");
      }
  })
  .then((booksData) => {
      res.send(JSON.stringify(booksData, null, 4));
  })
  .catch((error) => {
      res.status(404).json({ message: `No books found for author ${req.params.author}.` });
  });
});

// Get all books based on title
/*
public_users.get('/title/:title', function (req, res) {
  // Retrieve the title from the request parameters
  const title = req.params.title.toLowerCase();

  // Get all keys (ISBNs) from the 'books' object
  const bookKeys = Object.keys(books);

  // Create an array to store books matching the title
  let matchingBooks = [];

  // Iterate through the 'books' object and check for matching titles
  bookKeys.forEach((isbn) => {
    if (books[isbn].title.toLowerCase() === title) {
      matchingBooks.push(books[isbn]);
    }
  });

  // If there are matching books, return them
  if (matchingBooks.length > 0) {
    return res.send(JSON.stringify(matchingBooks,null,4));
  } else {
    // If no books are found, return a 404 error
    return res.status(404).json({ message: `No books found with title ${req.params.title}` });
  }
});
*/
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();

  new Promise((resolve, reject) => {
      const bookKeys = Object.keys(books);
      let matchingBooks = [];

      // Find books by title
      bookKeys.forEach((isbn) => {
          if (books[isbn].title.toLowerCase() === title) {
              matchingBooks.push(books[isbn]);
          }
      });

      if (matchingBooks.length > 0) {
          resolve(matchingBooks);
      } else {
          reject("No books found with this title");
      }
  })
  .then((booksData) => {
      res.send(JSON.stringify(booksData, null, 4));
  })
  .catch((error) => {
      res.status(404).json({ message: `No books found with title ${req.params.title}.` });
  });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  // Retrieve the ISBN from the request parameters
  const isbn = req.params.isbn;

  // Check if the book with the given ISBN exists in the books object
  const book = books[isbn];

  // If the book is found, return the reviews
  if (book) {
    return res.send(JSON.stringify(book.reviews,null,4));
  } else {
    // If the book is not found, return a 404 error
    return res.status(404).json({ message: `No reviews found for book with ISBN ${isbn}` });
  }
});

module.exports.general = public_users;
