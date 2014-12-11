var util = require("util");
var mongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/progressreports';
// if OPENSHIFT env variables are present, use the available connection info:
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  url = 'mongodb://'+ process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}

var mongoDB;
mongoClient.connect(url, function(err, db) {
  if (err) doError(err);
  mongoDB = db;
});

exports.insert = function(collection, query, callback) {
  console.log(JSON.stringify(query));
  mongoDB.collection(collection).insert(
    query,
    {safe: true},
    function(err, crsr) {
      if (err) doError(err);
      console.log("completed mongo insert");
      callback(crsr);
      console.log("done with insert callback");
    });
  console.log("leaving insert");
}

// FIND  
exports.find = function(collection, query, callback) {
  var crsr = mongoDB.collection(collection).find(query);
  crsr.toArray(function(err, docs) {
    if (err) doError(err);
    callback(docs);
  });
}

// UPDATE
exports.update = function(collection, query, callback) {
  console.log('query'+JSON.stringify(query.firstname));
  mongoDB.collection(collection).update(
    {name: query.name},
    query, {
      new: true
    }, function(err, crsr) {
      if (err) doError(err);
      callback('Update succeeded');
    });
}

// DELETE
exports.delete = function(collection, query, callback) {
  console.log('start delete');
  mongoDB.collection(collection).remove(
    {name: query.name},
    function(err, crsr) {
      if (err) doError(err);
      callback('Delete succeeded');
    });
}

var doError = function(e) {
          util.debug("ERROR: " + e);
          throw new Error(e);}