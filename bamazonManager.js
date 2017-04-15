//MANAGER FILE

//dependencies
var mysql = require("mysql");
var inquirer = require("inquirer");
var myModules = require("./modules.js");

//exported common stuff from myModules
var connection = myModules.connection;

//vars
var item_id;
var product_name;
var department_name;
var price;
var stock_quantity;
var requestQty;
var adjustedInventory;
var insertId;

//connect to the db
connection.connect();

var theEnd = function (){
	console.log(`
		`);
    connection.end();
}

//options
//* View Products for Sale
//		select all items - similar to Customer
//* View Low Inventory
//		select items with inventory <5
//* Add to Inventory
//		Update - similar to "cart" in Customer - adds inventory back to products
//* Add New Product
//		Insert - new item in products via inquirer

var runManager = function() {
    inquirer
        .prompt({
            name: "action",
            type: "rawlist",
            message: `----- Bamazon Manager Admin ------
What would you like to do?`,
            choices: [
                "View Products for Sale",
                "View Low Inventory",
                "Add to Inventory",
                "Add New Product",
                "Exit"
            ]
        })
        .then(function(answer) {
            switch (answer.action) {
                case "View Products for Sale":

                      showAllProducts(function() {runManager();});
                    break;

                case "View Low Inventory":
                      showLowInventory(function() {runManager();});
                    break;

                case "Add to Inventory":
                    addInventoryItems();
                    break;

                case "Add New Product":
                    newProduct(function() {runManager();});
                    break;
                case "Exit":
                    theEnd();
                    // connection.end();
                    break;
            }
        });
};



function renderProducts(products) {
    for (var i = 0; i < products.length; i++) {
        console.log(  products[i].item_id + " | " + products[i].product_name + " | $" + products[i].price + " | " + products[i].stock_quantity );
        // validIds.push (products[i].item_id);
    }
    console.log(`-------------------------------------------------`);
}

// showAllProducts
var showAllProducts = function(callback){
console.log(
        `  All IDs, Products, Prices, Inventory
-------------------------------------------------`
        );
    connection.query("SELECT * from products", function (error, products) {
        if (error) throw error;
        renderProducts(products)
        callback()
    });
}
// showAllProducts(function() {connection.end();});


//View low inventory
var showLowInventory = function(callback){
console.log(
        `  Low Inventory - Item IDs, Products, Prices, Inventory
-------------------------------------------------`
        );
    connection.query("SELECT * from products where stock_quantity < 5", function (error, products) {
        if (error) throw error;
        renderProducts(products)
        callback()
    });
}
// showLowInventory(function() {connection.end();});


//* Add to Inventory
//inquirer gets id and add qty
var addInventoryItems = function() {
    inquirer
    .prompt([
    {
        name: "itemId",
        type: "input",
        message: "Enter Product ID: "
    },
    {
        name: "quantity",
        type: "input",
        message: "Enter quantity: "
    }
    ])
    .then(function processAnswerCallback(answer) {
    	// console.log(answer.itemId , answer.quantity)
    	requestQty = answer.quantity;
    	item_id = answer.itemId;
    	var query = "SELECT item_id,stock_quantity, product_name, price FROM products WHERE item_id = ? LIMIT 1";

    	connection.query(query, [answer.itemId], function(err, res) {
    		if (err) throw err;

    		stock_quantity = res[0].stock_quantity;
    		product_name = res[0].product_name;

    		console.log( "Product ID: " + res[0].item_id + " || Current Inventory: " + res[0].stock_quantity);

    		adjustedInventory = parseInt(stock_quantity) + parseInt(requestQty);

    		updateInventory();
    	});
    });
};


//query to update inventory
var updateInventory = function(callback){
	var query = "UPDATE products SET stock_quantity = ? WHERE item_id = ?";
	connection.query(query,[adjustedInventory, item_id], function adjustedInvenoryCallback(err, res) {
		if (err) throw err;
		console.log( "Inventory has been set to " +adjustedInventory +" for Product ID " +item_id +", " +product_name.trim() +".");
		runManager();
	}
	);
}



//New Product
var newProduct = function(callback){
	inquirer
	.prompt([
	{
		name: "product_name",
		type: "input",
		message: "Enter Product Name: "
	},
	{
		name: "department_name",
		type: "input",
		message: "Enter Department: "
	},
	{
		name: "price",
		type: "input",
		message: "Enter price: "
	},
	{
		name: "stock_quantity",
		type: "input",
		message: "Enter quantity: "
	}
	])
	.then(function processAnswerCallback(answer) {

		connection.query("INSERT INTO products SET ?", {
			product_name: answer.product_name,
			department_name: answer.department_name,
			price: answer.price,
			stock_quantity: answer.stock_quantity
		}, function(err, res) {
			  console.log(res);
			  // insertId = res.insertId;
			  callback();
			});
		// confirmNewProduct();
	});
}



var confirmNewProduct = function(callback){
console.log(
        `  New Product - Item ID, Product, Price, Inventory
-------------------------------------------------`
        );
    connection.query("SELECT * from products where item_id = ?", insertId, function (error, products) {
        if (error) throw error;
        renderProducts(products)
        callback()
    });
}



runManager();


