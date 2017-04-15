//CUSTOMER FILE
//dependencies
var mysql = require("mysql");
var inquirer = require("inquirer");
var myModules = require("./modules.js");

//exported common stuff from myModules
var connection = myModules.connection;

//connect to the db
connection.connect();

//vars
var inventoryQty;
var requestQty;
var tempId;
var priceId;
var validIds = [];
var adjustedInventory;
var extPrice;
var prodSales;
var deptName;
var totalSales;

function renderProducts(products) {
    for (var i = 0; i < products.length; i++) {
        console.log(products[i].item_id + " | " + products[i].product_name + " | $" + products[i].price);
        validIds.push(products[i].item_id);
    }
    console.log(`-------------------------------------------------`);
}


function updateTable() {
    var query = "UPDATE products SET stock_quantity = ?, product_sales = ? WHERE item_id = ?";
    connection.query(
    query, [adjustedInventory, prodSales, tempId], function adjustedInvenoryCallback(err, res) {
        if (err) throw err;
        console.log("Inventory has been set to " + adjustedInventory + " for Product ID " + tempId + ", " + tempProduct.trim() + " for $" + extPrice + ".");
        theEnd();
    });
}

function selectDept() {
    var query = "SELECT * FROM departments WHERE department_name = ? LIMIT 1";
    connection.query(
    query, [deptName], function adjustedInvenoryCallback(err, res) {
        if (err) throw err;
        totalSales = res[0].total_sales;
        updateSales = parseInt(totalSales) + extPrice;
        // console.log('dept sales '+ totalSales );
    })
}

function updateDeptSales() {
    var query = "UPDATE departments SET total_sales = ? WHERE department_name = ?";
    connection.query(
    query, [totalSales, deptName], function (err, res) {
        if (err) throw err;
    })
}



var theEnd = function () {
    connection.end();
}


var runAllProducts = function (callback) {
    console.log(`All IDs, Products and Prices-------------------------------------------------`);
    connection.query("SELECT * from products", function (error, products) {
        if (error) throw error;
        renderProducts(products)
        callback()
    });
};

//inquiries
var productAddToCart = function () {
    inquirer.prompt([{
        name: "itemId",
        type: "input",
        message: "Enter Product ID: "
    },
    {
        name: "quantity",
        type: "input",
        message: "Enter quantity: "
    }]).then(function processAnswerCallback(answer) {
        // console.log(answer.itemId , answer.quantity)
        requestQty = answer.quantity;
        tempId = answer.itemId;
        var query = "SELECT * FROM products WHERE item_id = ? LIMIT 1";

        connection.query(query, [answer.itemId], function (err, res) {
            if (err) throw err;

            inventoryQty = res[0].stock_quantity;
            tempProduct = res[0].product_name;
            priceId = res[0].price;
            prodSales = res[0].product_sales;
            deptName = res[0].department_name
            console.log("Product ID: " + res[0].item_id + " || Current Inventory: " + res[0].stock_quantity);

            if (requestQty > inventoryQty) {
                console.log("Insufficient inventory.");
                theEnd();
            } else {
                console.log("Enough in stock to fill order.");
                adjustedInventory = inventoryQty - requestQty;
                extPrice = priceId * requestQty;
                prodSales = extPrice + prodSales;
                // console.log("prodSales" + prodSales);
                updateTable();

            }
        });

    });

};


runAllProducts(productAddToCart);