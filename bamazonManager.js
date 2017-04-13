//MANAGER FILE

//dependencies
var mysql = require("mysql");
var inquirer = require("inquirer");
var async = require("async");

var connection = mysql.createConnection({
    host: "localhost",
    user: "bootcamp",
    password: "",
    database: "bamazon"
});

//connect to the db
connection.connect();


//options
//* View Products for Sale
//		select all items - similar to Customer
//* View Low Inventory
//		select items with inventory <5
//* Add to Inventory
//		Update - similar to "cart" in Customer - adds inventory back to products
//* Add New Product
//		Insert - new item in products via inquirer