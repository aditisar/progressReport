var session = require('../models/session.js');

exports.createSession = function(req, res){
	var s = session("test");
	s.p1 = req.params.p1;
}

exports.init = function(io) {
	var currentlyOpen = 0; // keep track of the number of clients open
	var currentPlayers = 0; //number of players in game
	console.log("currentlyOpen = "+currentlyOpen);

  // When a new connection is initiated
	io.sockets.on('connection', function (socket) {
		++currentlyOpen;
		console.log("currentlyOpen = "+currentlyOpen);

		socket.on('user_join', function(username, room_number){
		    socket.username = username;
		    socket.room = room_number;
		    socket.join(room_number);
		});
		
		socket.on('send_message', function(message){
		    socket.broadcast.to(socket.room).emit('update_chat', socket.username, message);
		});
		
		socket.on('disconnect', function(){
		    console.log("Someone just left");
		    console.log("currentlyOpen = "+currentlyOpen);
		});		

	});


}

