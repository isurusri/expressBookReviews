const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username
    });
    return userswithsamename.length > 0;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.query.username;
    const password = req.query.password;

    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }

    if (isValid(username)) {
        let accessToken = jwt.sign({
            data: username
        }, 'access', {expiresIn: 60 * 60});

        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const user = req.user;
    if (books[isbn]) {
        if (books[isbn].reviews) {
            books[isbn].reviews[user.data] = {"review": review};
            return res.status(200).json({message: "Review added successfully"});
        } else {
            return res.status(404).json({message: "Book not found"});
        }
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const user = req.user;
    if (books[isbn]) {
        if (books[isbn].reviews) {
            delete books[isbn].reviews[user.data];
            return res.status(200).json({message: "Review deleted successfully"});
        } else {
            return res.status(404).json({message: "Book not found"});
        }
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
