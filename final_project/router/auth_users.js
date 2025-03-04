const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
	let userswithsamename = users.filter((user) => {
		return user.username === username;
	});

	if (userswithsamename.length > 0) {
		return false;
	} else {
		return true;
	}
}

const authenticatedUser = (username,password)=>{
	let validusers = users.filter((user) => {
		return (user.username === username && user.password === password);
	});

	if (validusers.length > 0) {
		return true;
	} else {
		return false;
	}
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.body;

    if (!req.session.authorization) {
        return res.status(403).json({ message: "You need to log in to post a review"});
    }
    const { username } = req.session.authorization;

    if (!review) {
        return res.status(400).json({ message: "Review content is required" });
    }

    let book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    let userReview = book.reviews[username];

    if (userReview) {
        userReview.review = review;
        return res.status(200).json({ message: "Review updated successfully", book: book});
    } else {
        book.reviews[username] = review;
        return res.status(200).json({ message: "Review added successfully", book: book });
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    if (!req.session.authorization) {
        return res.status(403).json({ message: "You need to log in to post a review" });
    }
    const { username } = req.session.authorization;

    let book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (username in book.reviews) {
        delete book.reviews[username];
        return res.status(200).json({ message: "Review deleted successfully", book:book});
    }
    return res.status(404).json({ message: "Review not found" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
