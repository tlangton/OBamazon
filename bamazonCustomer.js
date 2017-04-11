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

//vars
var inventoryQty = "";
var requestQty = "";
var tempId = "";
var priceId = "";
var validIds = [];
//inital display

function renderProducts(products) {
    for (var i = 0; i < products.length; i++) {
        console.log(  products[i].item_id + " | " + products[i].product_name + " | " + products[i].price );
        validIds.push (products[i].item_id);
    }
    console.log(`-------------------------------------------------`);
}



var runAllProducts = function(callback) {
    console.log(
        `  All IDs, Products and Prices
-------------------------------------------------`
        );

    connection.query("SELECT * from products", function (error, products) {
        if (error) throw error;
        renderProducts(products)
        callback()
    });
};

//inquiries
var productAddToCart = function() {
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
            tempId = answer.itemId;
            var query = "SELECT item_id,stock_quantity, product_name, price FROM products WHERE item_id = ?";

            connection.query(query, [answer.itemId], function lookUpInventoryCallback(err, res) {
                if (err) throw err;

                inventoryQty = res[0].stock_quantity;
                tempProduct = res[0].product_name;
                priceId = res[0].price;
                console.log( "Product ID: " + res[0].item_id + " || Current Inventory: " + res[0].stock_quantity);

                if (requestQty > inventoryQty) {
                    console.log("Insufficient inventory.");
                } else {
                    console.log("Enough in stock to fill order.");
                    var adjustedInventory = inventoryQty - requestQty;
                    var extPrice = priceId * requestQty;

                    //update the table
                    var query = "UPDATE products SET stock_quantity = ? WHERE item_id = ?";
                    connection.query(query, [adjustedInventory, tempId], function adjustedInvenoryCallback(err, res) {
                        if (err) throw err;
                        console.log(
                            "Inventory has been set to " + adjustedInventory + " for Product ID " + tempId + ", " + tempProduct.trim() +" for $"+extPrice+"."
                            );
                    }
                    );
                }
            });

        });

};


runAllProducts(productAddToCart);


// connection.end();
