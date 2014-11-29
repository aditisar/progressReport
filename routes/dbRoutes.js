// Requires the application model
var mongo = require("../models/user.js")

// No path:  display instructions for use
exports.index = function(req, res) {
  res.render('help');
};

exports.mongo = function(req, res){
  /*
   * The path parameters provide the operation to do and the collection to use
   * The query string provides the object to insert, find, or update
   */
	switch (req.params.operation) {
		case 'insert':	console.log("req.query is "+JSON.stringify(req.query));
		                mongo.insert( req.params.collection, 
		                              req.query,
		                              function(model) {
		                                res.render('mongo', {title: 'Mongo Demo', obj: model});
		                                }
		                              );
		                console.log("at end of insert case");
									 	break;
		case 'find':		mongo.find( req.params.collection, 
		                              req.query,
		                              function(model) {
              											res.render('mongo',{title: 'Mongo Demo', obj: model});
		                                }
		                              );
									 	break;
		case 'update':	mongo.update( req.params.collection, 
		                              req.query,
		                              function(model) {
              											res.render('success',{title: 'Mongo Demo', obj: model});
		                                }
		                              );
									 	break;
	}
	

// In the case that no route has been matched
exports.errorMessage = function(req, res){
  var message = '<p>Error, did not understand path '+req.path+"</p>";
	// Set the status to 404 not found, and render a message to the user.
  res.status(404).send(message);
};

