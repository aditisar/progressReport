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
	console.log("currentUsers = "+currentUsers);
  
  // When a new connection is initiated
	io.sockets.on('connection', function (socket) {
		currentlyOpen++;
		console.log("New window opened");
		console.log("currentlyOpen = "+currentlyOpen);
		console.log("currentUsers = "+currentUsers);
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
				socket.emit('displayWaitMessage');
				//userSockets[1].emit('loadEnterGoal');
			} else if (currentUsers == 2) {
				userSockets[1].emit('loadEnterGoal');
				userSockets[2].emit('loadEnterGoal');
			}
		});

		//once you submit a time, it should take you to the confirm/wait page with the go button that will appear once both goals are in/ time is locked for other user then
		socket.on('timeAndGoalSet', function(data){
			console.log('time has been set by ');
			//if user1 sets time, lock the time for user2
			if(socket == userSockets[1] && userSockets[2] != undefined){
				console.log('user1');
				userSockets[2].emit('lockTimeAndOtherGoal', {time: data.time, goal: data.goal});
			} else if (socket == userSockets[2]){ 			//if user2 sets the time, lock the time for user1
				console.log('user2');
				userSockets[1].emit('lockTimeAndOtherGoal', {time: data.time, goal: data.goal});
			}
			//trigger a client event that automatically sets the time for the  user who didn't pick the time 
		});
		
		socket.on('startTimer', function(){
			userSockets[1].emit('startTimer');
			userSockets[2].emit('startTimer');
		});

		//chat functionality
		socket.on('sendMessage', function(data){
			io.sockets.emit('newChat', {message: data.message});
		});

		socket.on('debug', function(data){
			console.log(data.message);
		});

		socket.on('disconnect', function(){
		    console.log("Someone just left");
		    currentlyOpen--;
		    if (socket == userSockets[1]){
		    	console.log('user 1 left');
		    	currentUsers--;
		    	//move p2 to p1's position
		    	userSockets[1] = userSockets[2];
		    	userSockets[2] = null;
		    } else if (socket == userSockets[2]){
		    	console.log('user 2 left');
		    	currentUsers--;
		    	//get rid of their socket
		    	userSockets[2] = null;
		    }
		    console.log("currentlyOpen = "+currentlyOpen);
		    console.log("currentUsers = "+currentUsers);

		});		

	});


}

