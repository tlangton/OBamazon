var mysql = require("mysql");

exports.connection = mysql.createConnection({
    host: "localhost",
    user: "bootcamp",
    password: "",
    database: "bamazon"
});



exports.theEnd = function(){
	connection.end()
};


