var session = require('../models/session.js');
//var session = require('../models/user.js');
//var users = [];
var userSockets = [];

exports.createSession = function(req, res){
	var s = session("test");
	s.p1 = req.params.p1;
}


exports.init = function(io) {
	var currentlyOpen = 0; //number of clients
	var currentUsers = 0; //number of players in game
	console.log("currentlyOpen = "+currentlyOpen);

  // When a new connection is initiated
	io.sockets.on('connection', function (socket) {
		currentlyOpen++;
		console.log("currentlyOpen = "+currentlyOpen);

		//if 2 people are already playing
		if (currentUsers == 2){
			console.log('dis test');
			socket.emit('displayBusyMessage');
		}
		
		//Since there is a max of two players at a time, only add new client if there is space
		socket.on('addPlayer', function(data){
			if(currentUsers == 0){
				//users.push(data.name);
				currentUsers++;
				userSockets[1] = socket;
			} else if (currentUsers == 1){
		    	currentUsers++;
				userSockets[2] =socket;
			} else {
				socket.emit('displayBusyMessage');
			}
			console.log("currentUsers = "+currentUsers);
		});
		
		//when a game is started, let each person enter a goal
		socket.on('startSession', function(message){
			//if there's only one user so far
			if(currentUsers == 1){
				userSockets[1].emit('loadEnterGoal');
			} else if (currentUsers == 2) {
				userSockets[2].emit('loadEnterGoal');
			}
		});


		
		socket.on('disconnect', function(){
		    console.log("Someone just left");
		    currentlyOpen--;
		    console.log("currentlyOpen = "+currentlyOpen);
		});		

	});


}

