$(document).ready(function() {

	var socket = io.connect('/')
	var username = "";

	//start with the username screen
	$('#setgoal').hide();
	$('#confirm').hide();
	$('#go').hide();
	$('#busy-message').hide();



	//When user clicks go, their username is stored in sessionStorage 
	//and they are taken to the setgoal input
    $('#homeGo').click(function(){
		if ($('#username').val().length > 0){

			username = $('#username').val();
			console.log('user: ' + username + " added");
			sessionStorage.playername = username;
			socket.emit('addPlayer', {name:username});
	  		//Once a user enters their name, a session for two clients is started
			socket.emit('startSession');
		}
	});

    socket.on('displayBusyMessage', function(){
    	$('home').hide();
    	$('#setgoal').hide();
		$('#confirm').hide();
		$('#go').hide();
		$('#busy-message').fadeIn();
    });

    socket.on('loadEnterGoal', function(){
		$('#home').fadeOut().promise().done(function(){
	  		$('#setgoal').fadeIn(1000);
	  	});
    });



	$('#goalSubmitButton').click(function(){
		if ($('#goalDescription').val().length > 0){

			goal = $('#goalDescription').val();
			sessionStorage.goal = goal;
			socket.emit('addPlayer', {name:username});
			$('#setgoal').fadeOut().promise().done(function(){
	  			$('#go').fadeIn(1000);
	  		});
			socket.emit('startGame');
		}
	});

});

