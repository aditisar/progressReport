$(document).ready(function() {

	var socket = io.connect('/')
	var username = "";

	//start with the username screen
	$('#setgoal').hide();
	$('#confirm').hide();
	$('#go').hide();
	$('#busy-message').hide();
	$('#awaiting-friend').hide();


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

    //this is called when >2 users try to join
    socket.on('displayBusyMessage', function(){
    	$('#home').hide();
    	$('#setgoal').hide();
		$('#confirm').hide();
		$('#go').hide();
		$('#awaiting-friend').hide();
		$('#busy-message').fadeIn();
    });

    //this is called when we're waiting for another player
    socket.on('displayWaitMessage', function(){
    	$('#home').hide();
    	$('#setgoal').hide();
		$('#confirm').hide();
		$('#go').hide();
		$('#busy-message').hide();
		$('#awaiting-friend').fadeIn();
    });


    //called after user has been added
    socket.on('loadEnterGoal', function(){
		$('#awaiting-friend').hide();
		$('#home').fadeOut().promise().done(function(){
	  		$('#setgoal').fadeIn(1000);
	  	});
    });

    //When someone submits a goal, if other person has not submitted yet, time is set 
	$('#goalSubmitButton').click(function(){
		if ($('#goalDescription').val().length > 0){
			goal = $('#goalDescription').val();
			sessionStorage.goal = goal;
			time = $('#time').val();
			socket.emit('timeSet', {time: time});
			$('#setgoal').fadeOut().promise().done(function(){
	  			$('#confirm').fadeIn(1000);
	  		});
		}
	});

	//once time is set by other player, don't let them choose and tell them why
	socket.on('lockTime', function(data){
		$('#time').val(data.time);
		$('#time').prop('disabled', true);
		$( '<em><p>Time has already been set by the other user</p></em>' ).insertAfter( '#time' );
		socket.emit('debug', {message: 'time should be locked'})
	});

});

