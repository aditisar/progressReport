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

		//Since there is a max of two players at a time, only add new client if there is space

		socket.on('addPlayer', function(data){
			if(currentUsers == 0){
				//users.push(data.name);
				currentUsers++;
				playerSockets[1] = socket;
			}

		    if (currentUsers == 1){
		    	currentUsers++;
				playerSockets[2] =socket;
			} else {
				socket.emit('displayWaitMessage');
			}
		});
		
		//when a game is started, check if the person is the first or second person to enter
		//then allow the user to enter their goal
		socket.on('startSession', function(message){
			//if there's only one user so far
			if(currentUsers == 1){
				userSockets[1].emit('loadEnterGoal');
			} else if (currentUsers == 2) {

			}

		});
		
		socket.on('disconnect', function(){
		    console.log("Someone just left");
		    currentlyOpen--;
		    console.log("currentlyOpen = "+currentlyOpen);
		});		

	});


}

