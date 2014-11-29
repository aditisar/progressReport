var util = require("util");
var mongoClient = require('mongodb').MongoClient;
/*
 * This is the connection URL
 * Give the IP Address / Domain Name (else localhost)
 * The typical mongodb port is 27012
 * The path part (here "fallTest") is the name of the databas
 */
var url = 'mongodb://localhost:27017/fallTest';
var mongoDB; // The connected database
// Use connect method to connect to the Server
mongoClient.connect(url, function(err, db) {
  if (err) doError(err);
  console.log("Connected correctly to server");
  mongoDB = db;
});


var user = function(name, description){
	return {
		username: name,
		description: description,
	}
}

user.prototype.getName = function(){
	return this.name;
}
user.prototype.getDescription = function(){
	return this.description;
}
user.prototype.toString = function(){
	return "Name: " + this.name + " Description: " + this.description;
}

