$(document).ready(function() {

	var socket = io.connect('/');
	var username = "";

	//start with the username screen
	$('#setgoal').hide();
	$('#confirm').hide();
	$('#go').hide();
	$('#busy-message').hide();
	$('#awaiting-friend').hide();
	$('#timeup').hide();


	//When user clicks go, their username is stored in sessionStorage 
	//and they are taken to the setgoal input

	//press go when you hit enter
	$('#username').keypress(function(e){
      if(e.keyCode==13)
      $('#homeGo').click();
    });

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
	  		$('#timeSet').hide();
	  	});
    });

    //When someone submits a goal, if other person has not submitted yet, time is set 
	$('#goalSubmitButton').click(function(){
		if ($('#goalDescription').val().length > 0){
			goal = $('#goalDescription').val();
			sessionStorage.myGoal = goal;
			$('#goalA').text(goal);
			time = $('#time').val();
			sessionStorage.time = time;
			socket.emit('timeAndGoalSet', {time: time, goal: goal});
			$('#setgoal').fadeOut().promise().done(function(){
	  			$('#confirmSubmitButton').hide();
	  			$('#confirm').fadeIn(1000);
	  		});
		//Display GO button if both goals have been set
			if($('#goalA').text().length>0 && $('#goalB').text().length>0){
				socket.emit('displayGO');
				console.log('passed code');

			}	
		}

	});


	socket.on('displayGO', function(){
		$('#confirmSubmitButton').fadeIn(300);
	});

	//once time is set by other player, don't let them choose and tell them why
	socket.on('lockTimeAndOtherGoal', function(data){
		$('#time').val(data.time);
		sessionStorage.time = data.time;
		$('#time').prop('disabled', true);
		$('#timeSet').show();
		sessionStorage.theirGoal = data.goal;
		$('#goalB').text(data.goal);
		socket.emit('debug', {message: 'time should be locked'})
	});
//NEED TO MAKE IT SO CONFIRM BUTTON only shows up after both are ready to go

	$('#confirmSubmitButton').click(function(){
		socket.emit('startTimer');
	});

	socket.on('startTimer', function(){
		$('#myGoal').append('<p>'+sessionStorage.myGoal +'</p>');
		$('#theirGoal').append('<p>'+sessionStorage.theirGoal +'</p>');
		$('#confirm').fadeOut().promise().done(function(){
	  			$('#go').fadeIn(1000);
	  		});
		timeInSeconds = sessionStorage.time * 60;
		$('#timer').show();
		$('#timer').removeClass('is-countdown');
		$('#timer').countdown({until: +timeInSeconds, format: 'mS', onExpiry: removeCountdown}); 

	});

	//chat functionality
	$('#chatbox-send').keypress(function(e){
      if(e.keyCode==13)
      $('#chatboxSendButton').click();
    });
	//once user hits enter, chat is sent
    $('#chatboxSendButton').click(function(){
    	var message = $('#chatbox-send').val();
    	socket.emit('sendMessage', {message: message, name: sessionStorage.playername})
    	$('#chatbox-send').val('');
    });
    //once new chat is recieved from server, it is displayed and scrolls
    socket.on('newChat', function(data){
    	var newMessage = '<p><strong>'+data.name+': </strong>'+data.message+'</p>'
    	$('#chatbox-content').append(newMessage);
		$('#chatbox-content')[0].scrollTop = $('#chatbox-content')[0].scrollHeight;
    });


	function removeCountdown(){
		$('#timer').fadeOut();
		$('#go').fadeOut().promise().done(function(){
	  			$('#timeup').fadeIn(1000);
	  	});	
	}

	//resets goal info (doesn't touch Sessionstorage tho in case they use the same one)
	function resetGoal(){
		$('#time').prop('disabled', false);
		sessionStorage.theirGoal="";
		$('#timeSet').hide();
		$('#chatbox-content').html('');
		$('#timer').html('');

	}

	//when user repeats goal, taken back to that page with same goal as before
	$('#repeatGoalButton').click(function(){
		$('#timeup').fadeOut().promise().done(function(){
	  			$('#setgoal').fadeIn(1000);
	  			$('#goalDescription').text(sessionStorage.myGoal);
	  			resetGoal();
	  	});
	});

	//when user repeats goal, taken back to that page with goal cleared
	$('#newGoalButton').click(function(){
		$('#goalDescription').val('');
		$('#timeup').fadeOut().promise().done(function(){
	  			$('#setgoal').fadeIn(1000);
	  			resetGoal();
	  	});
	});
	//refresh the page
	$('#finish').click(function(){
		location.reload();
	});

	$('#addComment').on("click",addComment);

	function addComment(){
    	var name = $("#commentName").val();
    	var comment = $("#comment").val();
    	var url= "comments/" + name + "/" + comment;
    	$.ajax({
    	    type: 'GET',
    	    url: url,
    	    success: function(result) {
    	        $('#createMessage').html(result);
    	    }
    });
    
};


});

