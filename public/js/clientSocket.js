$(document).ready(function(){

var myName = "";
var theirName = "";

var mySunken = 0;
var sunken = 0;

var socket = io.connect('/');
socket.on('players', function (data) {
  $("#shipGrid").text(data.number);
	});

socket.on('reset', function (data) {
	$('#home').fadeOut();
	$('#setgoal').fadeOut();
	$('#confirm').fadeOut();
	$('#go').fadeOut();
	//preload username with sessionStorage if exists
	if (sessionStorage.playername){
		$('#username').val(sessionStorage.playername);
	}else{
		$('#username').val("");
	}
	socket.emit('resetBoards');
	mySunken = 0;
	sunken = 0;
});

$('#reset').click(function(){
	$(this).fadeOut();
	$('#start').fadeIn();
});

/////////////////////// CONSTANTS ////////////////////////////
//always on screen

//load instructions
var xhr = new XMLHttpRequest(); 	// Create a new XMLHttpRequest
  
	xhr.onreadystatechange=function()  {		//  Define callback function
		if (xhr.readyState==4) {			// 4 means Response Complete
			if(xhr.status == 200) {		// 220 OK
				$('#instructions-info').html(xhr.responseText);
			} else {
				console.log("Error code " + xhr.status);
    }
   }
  }
xhr.open("GET", "instructions.txt", true); 		// Set the HTTP request parameters
xhr.send(null); 

//instructions
$('#info').click(function(){
	$('#instructions').fadeIn();
})

$('#info-close').click(function(){
	$('#instructions').fadeOut();
})

//preload username with sessionStorage if exists
if (sessionStorage.playername){
	$('#username').val(sessionStorage.playername);
}else{
	$('#username').val("");
}

/////////////////////// STARTING GAME //////////////////////////////
//connections made, awaiting player, game full, creating usernames

//submit username, call addPlayer on server
$('#username-submit').click(function(){
	if ($('#username').val().length > 1){
		myName = $('#username-title').val() + " " + $('#username').val();
		sessionStorage.playername = $('#username').val();
		socket.emit('addPlayer', {name:myName});
		$('#start').fadeOut();
		socket.emit('startGame');
	}
});

//if quorum not reached
socket.on('waiting', function(data){
	if (data.why == "player"){
		$('#awaiting-player').fadeIn();
	} else if (data.why == "setup"){
		$('#setup').fadeOut();
		$('#awaiting-setup').fadeIn();
	}
});

//if quorum reached
socket.on('quorumReached', function(data){
	$('#reg-logo').fadeIn();
	$('#quorum-full').fadeIn();
})


/////////////////////// SETUP BOARD //////////////////////////////

var selectedShip = "ship5"; //ship selected to move

//receives board from server and draws
//called from server~startGame
socket.on('loadSetup', function (data){
	$('#awaiting-player').fadeOut();
	$('#setup').fadeIn();
	$('#setup-welcome').html('Welcome, '+data.name+'! Set up your ships');
	reloadShipGrid(data);
})

$('#goLeft').click(function(){
	$('#noRotate').slideUp();
	socket.emit('moveLeft', { ship: selectedShip });
})

$('#goRight').click(function(){
	$('#noRotate').slideUp();
	socket.emit('moveRight', { ship: selectedShip });
})

$('#goUp').click(function(){
	$('#noRotate').slideUp();
	socket.emit('moveUp', { ship: selectedShip });
})

$('#goDown').click(function(){
	$('#noRotate').slideUp();
	socket.emit('moveDown', { ship: selectedShip });
})

$('#rotate').click(function(){
	$('#noRotate').slideUp();
	socket.emit('rotation', { ship: selectedShip });
})

/**** selecting ships  ****/
function selectShip(ship){
	var shipTag = "#" + selectedShip;
	$(shipTag).removeClass('borderClass');
	selectedShip = ship;
	shipTag = "#" + ship;
	$(shipTag).addClass('borderClass');
}

$('#ship2').click(function(){ selectShip("ship2") });
$('#ship3a').click(function(){ selectShip("ship3a") });
$('#ship3b').click(function(){ selectShip("ship3b") });
$('#ship4').click(function(){ selectShip("ship4") });
$('#ship5').click(function(){ selectShip("ship5") });

//sends board back to server for update
socket.on('updateBoard', function (data){
	reloadShipGrid(data);
});

//shows warning that cannot rotate
socket.on('noRotate', function(data){
	$('#noRotate').slideDown();
})

$('#setup-submit').click(function(){
	socket.emit('setupDone');
})

//short wait screen for game loading
socket.on('loading', function(data){
	setTimeout(loadingTimer,7000);
	$('#awaiting-setup').fadeOut();
	$('#setup').fadeOut();
	$('#loading').fadeIn();
	$('#loading').html('<img src="/images/loading.gif" width="600px">');
	theirName = data.theirName;
})


function loadingTimer(){
	socket.emit('coinToss');
}

//display to player that they are taking their turn first
socket.on('goFirst', function(data){
	$('#turn1').fadeIn();
})

//display to player that they are taking their turn second
socket.on('goSecond', function(data){
	$('#turn2').fadeIn();
})

$('#turn1').click(function(){
	$(this).fadeOut();
})

$('#turn2').click(function(){
	$(this).fadeOut();
})

/////////////////////// REGULAR DISPLAY SCREEN /////////////////////
//viewing both grids and waiting for the other person's turn

//calls reloadShipGrid and reloadAttackGrid
socket.on('loadGame', function(data){
	$('#loading').html("");
	$('#loading').fadeOut(); //if coming from loading
	$('#firing').fadeOut(); //if coming from firing
	$('#regScreen').fadeIn();
	reloadShipGrid(data.ship);
	reloadAttackGrid(data.attack);

	//update info
	$('#myName').html("Ahoy, "+myName+"!");
	$('#mySunken').html(mySunken+" of your ships are sunken");
	$('#opponent').html(theirName+"'s Board");
	$('#reg-oppInfo span').html("You've sunk "+sunken+" ships");
	if ($('#takeTurnButton').css('display')=="none"){
		$('#reg-logo span').html("Waiting for "+theirName+" to fire a shot...");
	}else{$('#reg-logo span').html()};
})

//this grid consists of where a player's ships are
//and where their opponent attacked them
//this grid consists of regular and white dots, and ship pieces
function reloadShipGrid(data){
	var grid = data.grid;
	var gridType = data.gridType;
	var cols = "<img id='spacer-big' src='images/none.png'>";
	for (var col=1; col<11; col++){
		cols += "<img id='col"+col+"-big' src='images/none.png'>";
	}
	document.getElementById(gridType).innerHTML = cols+"<br>"; //clear previous
	var letter = 'A';
	var number = 0;
	for (var j=0; j<10; j++){
		document.getElementById(gridType).innerHTML += "<img id='row"+letter+"-big' src='images/none.png'>";
		for (var i=0; i<10; i++){
			var imgID = letter+number;
			var str = "";
			if (grid[j][i] == 0){//reg
				str = "<img src='images/grid-reg.png' id="+imgID+"></div>";
			} else if (grid[j][i] == -1){//miss
				str = "<img src='images/grid-miss.png' id="+imgID+"></div>";
			} else { // ship
				str = "<img src='images/"+grid[j][i]+".png' id="+imgID+"></div>";
			}
			number++;
			document.getElementById(gridType).innerHTML += str;
		}
		document.getElementById(gridType).innerHTML += "<br>";
		letter = String.fromCharCode(letter.charCodeAt(0)+1);
		number = 0;
	}
};

//the attack grid is what a player sees of where they fired on their opponent
//this grid consists of only dots, no ships
function reloadAttackGrid(data){
	var grid = data.oppBoard;
	var gridType = data.attackGrid;
	var cols = "<img id='spacer-small' src='images/none.png'>";
	for (var col=1; col<11; col++){
		cols += "<img id='col"+col+"-small' src='images/none.png'>";
	}
	document.getElementById(gridType).innerHTML = cols+"<br>"; //clear previous
	var letter = 'A';
	var number = 0;
	for (var j=0; j<10; j++){
		document.getElementById(gridType).innerHTML += "<img id='row"+letter+"-small' src='images/none.png'>";
		for (var i=0; i<10; i++){
			var imgID = letter+number;
			var str = "";
			if (grid[j][i] == 0){//reg
				str = "<img src='images/grid-reg.png' id="+imgID+" width='30px'></div>";
			} else if (grid[j][i] == -1){//miss
				str = "<img src='images/grid-miss.png' id="+imgID+" width='30px'></div>";
			} else {
				if (grid[j][i].substring(grid[j][i].length-1, grid[j][i].length) == 't'){ //hit ship pieces
					str = "<img src='images/grid-hit.png' id="+imgID+" width='30px'></div>";
				} else { //opponent's unhit ship piece
					str = "<img src='images/grid-reg.png' id="+imgID+" width='30px'></div>";
				}
			}
			number++;
			document.getElementById(gridType).innerHTML += str;
		}
		document.getElementById(gridType).innerHTML += "<br>";
		letter = String.fromCharCode(letter.charCodeAt(0)+1);
		number = 0;
	}
};

//this function takes in the data obj of shots on ships
//returns number of ships sunk
function howManySunk(data){
	var result = 0;
	if (data['5'] == 5){ result++; };
	if (data['4'] == 4){ result++; };
	if (data['3a'] == 3){ result++; };
	if (data['3b'] == 3){ result++; };
	if (data['2'] == 2){ result++; };
	return result;
}


///////////////////////////// TAKING TURN ////////////////////////////////
//this function loads the screen for firing on opponent
socket.on('openFire', function(data){
	$('#loading').fadeOut();
	$('#regScreen').fadeOut();
	$('#firing').fadeIn();
	reloadAttackGrid({oppBoard: data.oppBoard, attackGrid: 'fireGrid'});
	var numSunk = howManySunk(data.sunken);
	$('#fireGrid-info span').html(numSunk+"/5");
})

//hover over cell
$("#fireGrid").on('mouseenter', 'img', function() {
	if ($(this).attr('src') == 'images/grid-reg.png'){
	    $(this).attr('src', 'images/grid-hover.png');
	}
});
$("#fireGrid").on('mouseleave', 'img', function() {
	if ($(this).attr('src') == 'images/grid-hover.png'){
		$(this).attr('src', 'images/grid-reg.png');
	}
});

//clicking a cell to fire
$("#fireGrid").on('click', 'img', function() {
	if ($(this).attr('src') == 'images/grid-hover.png'){
		cell = $(this).attr('id');
		$('fire-message').html("You fired a shot on "+cell);
		socket.emit('fire', { cell: cell });
	}
});

//displays post-selecting a cell to fire on
socket.on('shotFiredAway', function(data){
	$('#firing').fadeOut();
	$('#firingDone').fadeIn();
	var message = "";
	message += "You fired a shot on "+data.cell +".<br>"; //where fired
	message += data.hitOrMiss +"!<br>"; //hit or miss
	if (data.isSunk != null){
		message += "You sunk "+theirName+"'s "+data.isSunk;
		sunken++;
	}
	message += "<br><br> Click <b>here</b> to continue...";
	$('#firingDone').html(message);
})

$('#firingDone').click(function(){
	$(this).fadeOut();
	socket.emit('takeOrWait', {which: "wait"});
})

//displays post-being fired on
socket.on('shotFiredOn', function(data){
	var message = "";
	message += theirName+" fired at "+data.cell+". "; //where
	message += data.hitOrMiss+"! "; //hit or miss
	if (data.isSunk != null){
		message += "Your "+data.isSunk+" is sunk.";
		mySunken++;
		$('#mySunken').html(mySunken+" of your ships are sunken");
	}
	$('#reg-logo span').html(message);
	reloadShipGrid(data.reload);
	$('#takeTurnButton').fadeIn();
})

$('#takeTurn-button').click(function(){
	$('#takeTurnButton').fadeOut();
	socket.emit('takeOrWait', {which: "take"});
})

///////////////////////////// ENDING GAME ////////////////////////////////
// called for person who won game
socket.on('gameOver', function(data){
	$('#firing').fadeOut();
	$('#regScreen').fadeOut();
	if (data.verdict == 'winner'){
		$('#winner').fadeIn();
		var message = "";
		message += "You fired a shot on "+data.cell +".<br>"; //where fired
		message += data.hitOrMiss +"! "; //hit or miss
		if (data.isSunk != null){
			message += "You sunk "+theirName+"'s "+data.isSunk+".";
			sunken++;
		}
		message += "<br> You sunk all 5 ships!";
		$('#win-info').html(message);
		message = "<img src='images/winner.png'> <br> Congratulations, "+myName+"! You won the battle!";
		message += "<br><br> Click <b>here</b> to continue...";
		$('#win').html(message);
	} else {
		$('#loser').fadeIn();
		var message = "";
		message += theirName+" fired a shot on "+data.cell +".<br>"; //where fired
		message += data.hitOrMiss +"! "; //hit or miss
		if (data.isSunk != null){
			message += theirName+" sunk your last ship, the "+data.isSunk+".";
			sunken++;
		}
		message += "<br> All your ships are sunk."
		$('#lose-info').html(message);
		message = "<img src='images/loser.png'> <br> Sorry, "+myName+". You lost the battle!";
		message += "<br><br> Click <b>here</b> to continue...";
		$('#lose').html(message);
	}
});

$('#winner').click(function(){
	$(this).fadeOut();
	$('#scores').fadeIn();
	$('#newGame').fadeIn();
	listScores(); //adds list to #scores div
});

$('#loser').click(function(){
	$(this).fadeOut();
	$('#scores').fadeIn();
	$('#newGame').fadeIn();
	listScores(); //adds list to #scores div
});

$('#newGame').click(function(){
	$('#scores').fadeOut();
	$('#newGame').fadeOut();
	$('#start').fadeIn();
	//preload username with sessionStorage if exists
	if (sessionStorage.playername){
		$('#username').val(sessionStorage.playername);
	}else{
		$('#username').val("");
	}

	mySunken = 0;
	sunken = 0;
})

//called by winner's socket from server
socket.on('loadLeaderboard', function(data){
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0
	var yyyy = today.getFullYear();
	addScore(data.winner, data.loser, mm+"/"+dd+"/"+yyyy); //adds score to database
});


///////////////////////////// LEADERBOARD ////////////////////////////////
//database interaction

function addScore(winner, loser, date) {
	$.ajax({
			url: "addScore",
			type: "put",
			data: {
				winner: winner,
				loser: loser,
				date: date
			},
			success: function(data) {}
	});
	return false;	
}

function listScores(){
	$.ajax({
			url: "listScores",
			type: "get",
			data: {
			},
			success: function(data) {
				$('#scores').html('<div id="leaderboard"><img src="images/flag-left.png">Battle History<img src="images/flag-right.png"></div>'+data);
			}
	});
	return false;
}

function deleteScore(id){
	$.ajax({
			url: "score",
			type: "delete",
			data: {
				id: id
			},
			success: function(data) {}
	});
	return false;
}

}); //closing document ready

