var mongo = require("../models/comment.js")

//find specific comment
exports.getComments = function(req, res) {
  var comment = '';
  comment = {};
  mongo.find( "commentInfo", 
    comment,
    function(model) {
     res.render('commentview', { obj: model });
   }
   );
}

exports.loadCommentEdit = function(req, res) {
  var requestedcomment = {
    commentname: req.params.commentname,
    password: req.params.password,
    firstname: req.params.firstname,
    lastname: req.params.lastname
  };
  return res.render('editcomment', {comment: requestedcomment});
}

//update an comment
exports.postComment = function(req, res) {
  var comment = {
    name:req.params.name, 
    comment:req.params.comment
  };
  console.log(comment);
  mongo.update( req.params.collection, 
    comment,
    function(model) {
      res.end('Successful Update');
    }
    );
}

//create a new comment
exports.addComment = function(req, res) {
  console.log('adding comment');
  var comment = 
  {	
  	name: req.params.name,
    comment: req.params.comment,
  };
  console.log('comment to be added: '+JSON.stringify(comment));
  mongo.insert( req.params.collection, 
    req.query,
    function(model) {
      console.log("adding comment");
      res.render('home');
    });
}

//delete an comment
exports.deleteUser = function(req, res) {
  console.log('deleting a comment');
  var comment = {commentname:req.params.commentname};
  console.log(comment);
    mongo.delete( req.params.collection, 
     comment,
     function(model) {
        res.render('home');
      }
    );
  }

exports.errorMessage = function(req, res){
  var message = '<p>Error, did not understand path '+req.path+"</p>";
  // Set the status to 404 not found, and render a message to the user.
  res.status(404).send(message);
};