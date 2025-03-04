const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

	if (!username) {
		return res.status(404).json({message: "Please provide a username."});
	}
	if (!password) {
		return res.status(404).json({message: "Please provide a password."});
	}

	if (isValid(username)) {
		users.push({"username": username, "password": password});
		return res.status(200).json({message: "User successfully registered. Now you can login"});
	}
	return res.status(404).json({message: "User already exists!"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
	res.send(JSON.stringify(books,null,4));
});
public_users.get('/async', function (req, res) {
	axios.get('http://localhost:5000/')
	  .then(response => {
		res.send(JSON.stringify(response.data, null, 4)); 
	  })
	  .catch(error => {
		console.error('Error fetching books:', error);
		res.status(500).send('Error fetching books');
	  });
  });

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
	const isbn = req.params.isbn;
	res.send(books[isbn]);
});
public_users.get('/async/isbn/:isbn', function (req, res) {
	const isbn = req.params.isbn;
	axios.get(`http://localhost:5000/isbn/${isbn}`)
	  .then(response => {
		res.send(JSON.stringify(response.data, null, 4)); 
	  })
	  .catch(error => {
		res.status(500).send(`Error fetching book by ISBN. ${error}`);
	  });
  });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
	const author = req.params.author;
	let book_list = []
	for (let key in books) {
		if (books[key].author.toLowerCase().includes(author.toLowerCase())) {
			book_list.push(books[key]);
		}
	}
	if (book_list.length > 0)
	{
		res.send(book_list);
	} else {
		return res.status(404).json({message: `No book by ${author} found`});
	}
});
public_users.get('/async/author/:author', function (req, res) {
	const author = req.params.author;
	axios.get(`http://localhost:5000/author/${author}`)
	  .then(response => {
		res.send(JSON.stringify(response.data, null, 4)); 
	  })
	  .catch(error => {
		res.status(500).send(`Error fetching book by author. ${error}`);
	  });
  });

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
	const title = req.params.title;
	let book_list = []
	for (let key in books) {
		if (books[key].title.toLowerCase().includes(title.toLowerCase())) {
			book_list.push(books[key]);
		}
	}
	if (book_list.length > 0)
	{
		res.send(book_list);
	} else {
		return res.status(404).json({message: `No book with title ${title} found`});
	}
});
public_users.get('/async/title/:title', function (req, res) {
	const title = req.params.title;
	axios.get(`http://localhost:5000/title/${title}`)
	  .then(response => {
		res.send(JSON.stringify(response.data, null, 4)); 
	  })
	  .catch(error => {
		res.status(500).send(`Error fetching book by title. ${error}`);
	  });
  });

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
	const isbn = req.params.isbn;
	let review_list = []
	const book = books[isbn]
	for (let key in book.reviews) {
		review_list.push(book[key]);
	}
	if (review_list.length > 0)
	{
		res.send(review_list);
	} else {
		return res.status(404).json({message: `No review on book with ISBN ${isbn} found`});
	}
});

module.exports.general = public_users;
