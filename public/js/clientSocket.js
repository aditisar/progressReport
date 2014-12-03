$(document).ready(function() {

	var socket = io.connect('/')
	var username = "";

    //$('#home').fadeOut();
	$('#setgoal').hide();
	$('#confirm').hide();
	$('#go').hide();
    
    $('#homeGo').click(function(){
		if ($('#username').val().length > 1){

			username = $('#username').val();
			console.log('user: ' + username + " added");
			sessionStorage.playername = $('#username').val();
			socket.emit('addPlayer', {name:username});
			$('#home').fadeOut().promise().done(function(){
	  			$('#setgoal').fadeIn(1000);
	  		});
			socket.emit('startGame');
		}
	});

});

