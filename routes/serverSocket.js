var session = require('../models/session.js');


exports.init = function(io) {
	var currentlyOpen = 0; // keep track of the number of clients open
	var currentPlayers = 0; //number of players in game
	console.log("currentlyOpen = "+currentlyOpen);

  // When a new connection is initiated
	io.sockets.on('connection', function (socket) {
		++currentlyOpen;
		var numPlayer = 0; //which number player this client is
		console.log("currentlyOpen = "+currentlyOpen);
		//add username to game, save sockets of 2 players
		socket.on('addPlayer', function(data){
			currentPlayers++;
			if (currentPlayers == 1){
				playerList.One = data.name;
				numPlayer = 1;
				users[1] = socket;
			} else if (currentPlayers == 2){
				playerList.Two = data.name;
				numPlayer = 2;
				myNumber = 2;
				users[2] = socket;
			}
			// do nothing for currentPlayers 2+ because quorum reached
		});

		//beginning 2-player gameplay
		socket.on('startGame', function(data){
			if (playerList.Two == undefined) { //no second player yet
				socket.emit('waiting', { why: "player"});
			} else if (numPlayer == 2){ //second player enters: update first player
				//create setup screen
				users[1].emit('loadSetup', { grid: OneBoard, gridType: 'setupGrid', name: playerList.One});
				socket.emit('loadSetup', { grid: TwoBoard, gridType: 'setupGrid', name: playerList.Two});
			} else { //two players already
				guests.push(socket);
				socket.emit('quorumReached', {});
			}
		});


		//*************** SETUP ***************//

		/**** moves called from clicks in client ****/
		socket.on('moveLeft', function(data){
			var grid;
			if (numPlayer == 1){
				grid = OneBoard;
			} else {
				grid = TwoBoard;
			}
			if (canMoveLeft(grid, data.ship)){ moveLeft(grid, data.ship)};
		});

		socket.on('moveRight', function(data){
			var grid;
			if (numPlayer == 1){
				grid = OneBoard;
			} else {
				grid = TwoBoard;
			}
			if (canMoveRight(grid, data.ship)){ moveRight(grid, data.ship)};
		});

		socket.on('moveUp', function(data){
			var grid;
			if (numPlayer == 1){
				grid = OneBoard;
			} else {
				grid = TwoBoard;
			}
			if (canMoveUp(grid, data.ship)){ moveUp(grid, data.ship)};
		});

		socket.on('moveDown', function(data){
			var grid;
			if (numPlayer == 1){
				grid = OneBoard;
			} else {
				grid = TwoBoard;
			}
			if (canMoveDown(grid, data.ship)){ moveDown(grid, data.ship)};
		});

		socket.on('rotation', function(data){
			var grid;
			if (numPlayer == 1){
				grid = OneBoard;
			} else {
				grid = TwoBoard;
			}
			rotateShip(grid, data.ship);
		});

		socket.on('setupDone', function(){
			done++;
			if (done == 1){
				socket.emit('waiting', { why: "setup" });
			} else if (done == 2){
				users[1].emit('loading', {theirName: playerList.Two});
				users[2].emit('loading', {theirName: playerList.One});
			}
		});

	  //********* REGULAR DISPLAY SCREEN ********//
	  socket.on('coinToss', function(){
	  	//randomly select a player to go first
	  	if (socket==users[2]){ //only goes off once
		  	var randnum=Math.floor(Math.random()*10)+1
		  	if (randnum % 2 == 0){
		  		//player 2 goes first
			  	users[2].emit('openFire', {
			  		oppBoard: OneBoard,
			  		sunken: sunkenShips['2']
			  	});
			  	users[2].emit('goFirst');

			  	users[1].emit('loadGame', { 
			  		ship: {grid: OneBoard, gridType:'shipGrid'}, 
			  		attack: {oppBoard: TwoBoard, attackGrid: 'attackGrid'}
			  	});
		  		users[1].emit('goSecond');
		  	} else {
		  		//player 1 goes first
			  	users[1].emit('openFire', {
			  		oppBoard: TwoBoard,
			  		sunken: sunkenShips['1']
			  	});
			  	users[1].emit('goFirst');

			  	users[2].emit('loadGame', { 
			  		ship: {grid: TwoBoard, gridType:'shipGrid'}, 
			  		attack: {oppBoard: OneBoard, attackGrid: 'attackGrid'}
			  	});
		  		users[2].emit('goSecond');
		  	}
		  }
	  })

	  //takes in whose turn it is and emits respective screens
	  socket.on('takeOrWait', function (data){
	  	if (data.which == "take"){
	  		//going to take turn
	  		if (socket==users[1]){
		  		socket.emit('openFire', {
			  		oppBoard: TwoBoard,
			  		sunken: sunkenShips['1']
			  	});
		  	} else {
		  		socket.emit('openFire', {
			  		oppBoard: OneBoard,
			  		sunken: sunkenShips['2']
			  	});
		  	}
		} else {
	  		//going to wait turn
	  		if (socket==users[1]){
			  	socket.emit('loadGame', { 
			  		ship: {grid: OneBoard, gridType:'shipGrid'}, 
			  		attack: {oppBoard: TwoBoard, attackGrid: 'attackGrid'}
			  	});
			} else {
				socket.emit('loadGame', { 
			  		ship: {grid: TwoBoard, gridType:'shipGrid'}, 
			  		attack: {oppBoard: OneBoard, attackGrid: 'attackGrid'}
			  	});
			}
	  	}
	  });

	  //********* FIRING *********//
	  
	  socket.on('fire', function(data){
	  	if (socket==users[1]){ //player 1 firing on player 2
	  		var grid1 = OneBoard;
	  		var grid2 = TwoBoard;
	  		var plyr = '1';
	  	} else { //player 2 firing on player 1
	  		var grid1 = TwoBoard;
	  		var grid2 = OneBoard;
	  		var plyr = '2';
	  	}

	  	var cell = data.cell;
  		var row = cell.charCodeAt(0) - 65; //letter
		var column = cell.charAt(1); //number moved left 1
		var isSunk = null;
		var hitOrMiss;
		var allSunk = false;
		if (isHit(cell, grid2)){ //hit
			hitOrMiss = "Hit";
			grid2[row][column] += "-hit";

			//check if sunk a ship
			var gridCell = grid2[row][column];
			if (gridCell.charAt(4) == '5'){
				sunkenShips[plyr]['5'] += 1;
				if (sunkenShips[plyr]['5'] == 5){ isSunk = "Aircraft Carrier" } //sunk a ship
			};
			if (gridCell.charAt(4) == '4'){
				sunkenShips[plyr]['4'] += 1;
				if (sunkenShips[plyr]['4'] == 4){ isSunk = "Battleship" } //sunk a ship 
			};
			if (gridCell.charAt(5) == 'a'){ 
				sunkenShips[plyr]['3a'] += 1;
				if (sunkenShips[plyr]['3a'] == 3){ isSunk = "Submarine" } //sunk a ship 
			};
			if (gridCell.charAt(5) == 'b'){ 
				sunkenShips[plyr]['3b'] += 1; 
				if (sunkenShips[plyr]['3b'] == 3){ isSunk = "Cruiser" } //sunk a ship 
			};
			if (gridCell.charAt(4) == '2'){ 
				sunkenShips[plyr]['2'] += 1; 
				if (sunkenShips[plyr]['2'] == 2){ isSunk = "Destroyer" } //sunk a ship 
			};
			//check if all ships sunk
			if (allShipsSunk(plyr)){
				allSunk = true;
			}
		} else { // miss
			grid2[row][column] = -1;
			hitOrMiss = "Miss";
		}
		var cellWord = cell.charAt(0)+(Number(column)+1); //adjust from 0-9 to 1-10
		if (allSunk){
			if (socket==users[1]){
				//user 1 won

				//add score to leaderboard
				users[1].emit('loadLeaderboard', {
					winner: playerList.One,
					loser: playerList.Two
				});

				users[1].emit('gameOver', { 
					verdict: "winner",
					cell: cellWord,
					hitOrMiss: hitOrMiss,
					isSunk: isSunk
				});
				users[2].emit('gameOver', {
					verdict: "loser",
					cell: cellWord,
					hitOrMiss: hitOrMiss,
					isSunk: isSunk
				})
			} else {
				//user 2 won

				//add score to leaderboard
				users[2].emit('loadLeaderboard', {
					winner: playerList.Two,
					loser: playerList.One
				});

				users[2].emit('gameOver', { 
					verdict: "winner",
					cell: cellWord,
					hitOrMiss: hitOrMiss,
					isSunk: isSunk
				});
				users[1].emit('gameOver', {
					verdict: "loser",
					cell: cellWord,
					hitOrMiss: hitOrMiss,
					isSunk: isSunk
				})
			}
			finishGame(); //resets boards, etc.
		} else { //no one won yet
			if (socket==users[1]){
				users[1].emit('shotFiredAway', { 
					cell: cellWord,
					hitOrMiss: hitOrMiss,
					isSunk: isSunk
				});
				users[2].emit('shotFiredOn', {
					cell: cellWord,
					hitOrMiss: hitOrMiss,
					isSunk: isSunk,
					reload: {grid: TwoBoard, gridType: 'shipGrid'}
				})
			} else {
				users[2].emit('shotFiredAway', { 
					cell: cellWord,
					hitOrMiss: hitOrMiss,
					isSunk: isSunk
				});
				users[1].emit('shotFiredOn', {
					cell: cellWord,
					hitOrMiss: hitOrMiss,
					isSunk: isSunk,
					reload: {grid: OneBoard, gridType: 'shipGrid'}
				})
			}
		}
	  });
	
	  // returns true if shot is hit on grid, else false
	  function isHit(cell, grid){ 
		var row = cell.charCodeAt(0) - 65; //letter
		var column = cell.charAt(1); //number
		if (grid[row][column] != 0){ //a ship is at this cell for this grid
			return true;
		}
		return false;
	  }

	  //returns true if all ships are sunk, else false
	  function allShipsSunk(plyr){
	  	if ((sunkenShips[plyr]['5'] == 5) &&
	  		(sunkenShips[plyr]['4'] == 4) &&
	  		(sunkenShips[plyr]['3a'] == 3) &&
	  		(sunkenShips[plyr]['3b'] == 3) &&
	  		(sunkenShips[plyr]['2'] == 2)) { return true };

	  	return false;
	  }

	  //when finish game
	  function finishGame(){
	  	users = [0];
	 	playerList = {};
	 	currentPlayers = 0;
	 	done = 0;
	 	sunkenShips = {'1':{'5': 0, '4': 0, '3a': 0, '3b': 0, '2': 0}, '2':{'5': 0, '4': 0, '3a': 0, '3b': 0, '2': 0}}; 

	 	//reset boards
	 	OneBoard = createStarterBoard();
		TwoBoard = createStarterBoard();
	  }

	  //********* RESET AND DISCONNECT ********//
	  socket.on('resetBoards', function(){
	  	OneBoard = createStarterBoard();
		TwoBoard = createStarterBoard();
	  })

	  function createStarterBoard(){
	  	var newGrid = [];
		for (var i=0; i<10; i++){
			newGrid.push([]);
			for (var j=0; j<10; j++){
				newGrid[i].push(0);
			}
		}
		//set up ships preloaded
		newGrid[0][0] = "ship2v0";
		newGrid[1][0] = "ship2v1";

		newGrid[0][1] = "ship3av0";
		newGrid[1][1] = "ship3av1";
		newGrid[2][1] = "ship3av2";

		newGrid[0][2] = "ship3bv0";
		newGrid[1][2] = "ship3bv1";
		newGrid[2][2] = "ship3bv2";

		newGrid[0][3] = "ship4v0";
		newGrid[1][3] = "ship4v1";
		newGrid[2][3] = "ship4v2";
		newGrid[3][3] = "ship4v3";

		newGrid[0][4] = "ship5v0";
		newGrid[1][4] = "ship5v1";
		newGrid[2][4] = "ship5v2";
		newGrid[3][4] = "ship5v3";
		newGrid[4][4] = "ship5v4";
		return newGrid;
	  }
		
		
				

	  socket.on('disconnect', function() {
	  	console.log('A player is disconnecting..');
	  	if (users.indexOf(socket) > -1 ){ //if a player leaves
		 	if (users.length == 3){
		 		users[1].emit('reset');
		 		users[2].emit('reset');
		 		for (var i=0; i<guests.length; i++){
		 			guests[i].emit('reset');
		 		}
		 	};
		 	users = [0];
		 	playerList = {};
		 	currentPlayers = 0;
		 	done = 0;
		 	sunkenShips = {'1':{'5': 0, '4': 0, '3a': 0, '3b': 0, '2': 0}, '2':{'5': 0, '4': 0, '3a': 0, '3b': 0, '2': 0}};
		}

		if (guests.indexOf(socket) > -1) { //is a guest
			//remove from guests array
			guests.splice(guests.indexOf(socket), 1);
		}
	  	
	  	--currentlyOpen;
	 	console.log("currentlyOpen = "+currentlyOpen);

	 	

	  	socket.broadcast.emit('nPlayers', { number: currentPlayers});
	  });


	  /////////////////// SETUP MOVE CHECKS //////////////////////

	  	//MOVELEFT: takes in the ship name that is being moved
		//ex: "2", "3a"
		function moveLeft(grid, ship){
			for (var i=0; i<10; i++){
				for (var j=0; j<10; j++){
					// check that ship is in cell && it is the ship we are looking for
					if ((grid[i][j].length > 1) && (grid[i][j].indexOf(ship) !== -1)){
						//VERTICAL SHIP
						if (grid[i][j].indexOf('v') !== -1){
							grid[i][j-1] = grid[i][j]; //change cell on left to current cell's value
							grid[i][j] = 0; //clear current cell
						} else { //HORIZONTAL SHIP
							//check if the cell is the last rightmost segment of the ship
							if ((grid[i][j].slice(-1) == Number(ship.charAt(4))-1)){
								grid[i][j-1] = grid[i][j]; //change cell on left to current cell's value
								grid[i][j] = 0; //make last segment of ship blank cell
							} else { //if
								grid[i][j-1] = grid[i][j]; //change cell on left to current cell's value
							}
						}
					}
				}
			}
			socket.emit('updateBoard', { grid: grid, gridType: 'setupGrid' });
		}

		//CANMOVELEFT: takes in a ship name and checks that the space to its left is empty
		//returns true if space is empty, else false
		function canMoveLeft(grid, ship){
			for (var i=0; i<10; i++){
				for (var j=0; j<10; j++){
					if ((grid[i][j].length > 1) && (grid[i][j].indexOf('v') !== -1)){
						if ((grid[i][j].indexOf(ship) !== -1) && (grid[i][j-1] != 0)){ //(U2GridMap[i][j].length > 1) && << removed so no repeat
							return false;
						}
					} else {
						if ((grid[i][j].length > 1) && (grid[i][j].indexOf(ship) !== -1) && (grid[i][j].slice(-1) == 0)){
							return (grid[i][j-1] == 0);
						}
					}
				}
			}
			return true;
		}

		//MOVERIGHT: takes in the ship name that is being moved
		//ex: "2", "3a"
		function moveRight(grid, ship){
			for (var i=9; i>=0; i--){
				for (var j=9; j>=0; j--){
					// check that ship is in cell && it is the ship we are looking for
					if ((grid[i][j].length > 1) && (grid[i][j].indexOf(ship) !== -1)){
						//VERTICAL SHIP
						if (grid[i][j].indexOf('v') !== -1){
							grid[i][j+1] = grid[i][j]; //change cell on right to current cell's value
							grid[i][j] = 0; //clear current cell
						} else { //HORIZONTAL SHIP
							//check if the cell is the first leftmost segment of the ship
							if ((grid[i][j].slice(-1) == 0)){
								grid[i][j+1] = grid[i][j]; //change cell on right to current cell's value
								grid[i][j] = 0; //make first segment of ship blank cell
							} else { //if
								grid[i][j+1] = grid[i][j]; //change cell on right to current cell's value
							}
						}
					}
				}
			}
			socket.emit('updateBoard', { grid: grid, gridType: 'setupGrid' });
		}

		//CANMOVERIGHT: takes in a ship name and checks that the space to its right is empty
		//returns true if space is empty, else false
		function canMoveRight(grid, ship){
			for (var i=9; i>=0; i--){
				for (var j=9; j>=0; j--){
					if ((grid[i][j].length > 1) && (grid[i][j].indexOf('v') !== -1)){
						if ((grid[i][j].indexOf(ship) !== -1) && (grid[i][j+1] != 0)){ //(U2GridMap[i][j].length > 1) && << removed so no repeat
							return false;
						}
					} else {
						if ((grid[i][j].length > 1) && (grid[i][j].indexOf(ship) !== -1) && (grid[i][j].slice(-1) == ship.charAt(4)-1)){
							return (grid[i][j+1] == 0);
						}
					}
				}
			}
			return true;
		}

		//MOVEUP: takes in the ship name that is being moved
		//ex: "2", "3a"
		function moveUp(grid, ship){
			for (var i=0; i<10; i++){
				for (var j=0; j<10; j++){
					// check that ship is in cell && it is the ship we are looking for
					if ((grid[i][j].length > 1) && (grid[i][j].indexOf(ship) !== -1)){
						//VERTICAL SHIP
						if (grid[i][j].indexOf('v') !== -1){
							//check if the cell is the bottom most segment of the ship
							if ((grid[i][j].slice(-1) == Number(ship.charAt(4))-1)){
								grid[i-1][j] = grid[i][j]; //change cell on above to current cell's value
								grid[i][j] = 0; //make bottom segment of ship blank cell
							} else { //if
								grid[i-1][j] = grid[i][j]; //change cell above to current cell's value
							}
						} else { //HORIZONTAL SHIP
							grid[i-1][j] = grid[i][j]; //change cell above to current cell's value
							grid[i][j] = 0; //clear current cell
						}
					}
				}
			}
			socket.emit('updateBoard', { grid: grid, gridType: 'setupGrid' });
		}

		//CANMOVEUP: takes in a ship name and checks that the space above it is empty
		//returns true if space is empty, else false
		function canMoveUp(grid, ship){
			for (var i=0; i<10; i++){
				for (var j=0; j<10; j++){
					if ((grid[i][j].length > 1) && (grid[i][j].indexOf('v') !== -1)){
						if ((grid[i][j].indexOf(ship) !== -1) && (grid[i][j].slice(-1) == 0)){ //(U2GridMap[i][j].length > 1) &&  <<removed so no repeat
							try{
								return (grid[i-1][j] == 0);
							} catch(e) { //at top of grid so i-1 undefined
								return false;
							}
						}
					} else {
						if ((grid[i][j].length > 1) && (grid[i][j].indexOf(ship) !== -1) && ((grid[i-1] == undefined) || (grid[i-1][j] != 0))){
							return false;
						}
					}
				}
			}
			return true;
		}

		//MOVEDOWN: takes in the ship name that is being moved
		//ex: "2", "3a"
		function moveDown(grid, ship){
			for (var i=9; i>=0; i--){
				for (var j=9; j>=0; j--){
					// check that ship is in cell && it is the ship we are looking for
					if ((grid[i][j].length > 1) && (grid[i][j].indexOf(ship) !== -1)){
						//VERTICAL SHIP
						if (grid[i][j].indexOf('v') !== -1){
							//check if the cell is the top most segment of the ship
							if (grid[i][j].slice(-1) == 0){
								grid[i+1][j] = grid[i][j]; //change cell under to current cell's value
								grid[i][j] = 0; //make top segment of ship blank cell
							} else { //if
								grid[i+1][j] = grid[i][j]; //change cell under to current cell's value
							}
						} else { //HORIZONTAL SHIP
							grid[i+1][j] = grid[i][j]; //change cell under to current cell's value
							grid[i][j] = 0; //clear current cell
						}
					}
				}
			}
			socket.emit('updateBoard', { grid: grid, gridType: 'setupGrid' });
		}

		//CANMOVEDOWN: takes in a ship name and checks that the space below it is empty
		//returns true if space is empty, else false
		function canMoveDown(grid, ship){
			for (var i=9; i>=0; i--){
				for (var j=9; j>=0; j--){
					if ((grid[i][j].length > 1) && (grid[i][j].indexOf('v') !== -1)){
						if ((grid[i][j].indexOf(ship) !== -1) && (grid[i][j].slice(-1) == Number(ship.charAt(4))-1)){ //(U2GridMap[i][j].length > 1) &&  <<removed so no repeat
							try{
								return (grid[i+1][j] == 0);
							} catch(e) { //at bottom of grid so i+1 undefined
								return false;
							}
						}
					} else {
						if ((grid[i][j].length > 1) && (grid[i][j].indexOf(ship) !== -1) && ((grid[i+1] == undefined) || (grid[i+1][j] != 0))){
							return false;
						}
					}
				}
			}
			return true;
		}

		//ROTATESHIP: takes in ship to rotate around ship segment 0
		//calls canRotate
		function rotateShip(grid, ship){
			// $('#noRotate').html("");
			for (var i=9; i>=0; i--){
				for (var j=9; j>=0; j--){
					if ((grid[i][j].length > 1) && (grid[i][j].indexOf(ship) !== -1) && (grid[i][j].indexOf(0) !== -1)){
						if (canRotateRight(grid, i, j, ship)){
							var x = i;
							var y = j;
							if (grid[i][j].indexOf('v') !== -1){ //vertical
								var axis = JSON.stringify(grid[x][y]).substring(1, grid[x][y].length+1);
								grid[x][y] = axis.split('v')[0] + 'H' + axis.slice(-1);
								for (var n=1; n<ship.charAt(4); n++){
									var horiz = JSON.stringify(grid[x+n][y]).substring(1, grid[x+n][y].length+1);
									grid[x][y+n] = horiz.split('v')[0] + 'H' + horiz.slice(-1);
									grid[x+n][y] = 0;
								}
							} else {
								var axis = JSON.stringify(grid[x][y]).substring(1, grid[x][y].length+1);
								grid[x][y] = axis.split('H')[0] + 'v' + axis.slice(-1);
								for (var m=1; m<ship.charAt(4); m++){
									var verti = JSON.stringify(grid[x][y+m]).substring(1, grid[x][y+m].length+1);
									grid[x+m][y] = verti.split('H')[0] + 'v' + verti.slice(-1);
									grid[x][y+m] = 0;
								}
							}

						}else if (canRotateLeft(grid, i, j, ship)){
							var x = i;
							var y = j;
							if (grid[i][j].indexOf('v') !== -1){
								for (var n=0; n<ship.charAt(4); n++){
									var horiz = JSON.stringify(grid[x+n][y]).substring(1, grid[x+n][y].length+1);
									grid[x][y-(ship.charAt(4)-n-1)] = horiz.split('v')[0] + 'H' + n;
									grid[x+n][y] = 0;
								}
							}
							break; //to escape i and j for-loops from rewriting 

						}else {
							//cannot rotate
							socket.emit('noRotate')
						}
					}
				}
			}
			socket.emit('updateBoard', { grid: grid, gridType: 'setupGrid' });
		}

		//CANROTATERIGHT: takes in cell coordinates of ship segment 0 and ship name
		//returns true if (lengthOfShip - 1) spaces to right of segment 0 are empty
		function canRotateRight(grid, row, col, ship){
			var length = ship.charAt(4);
			if (grid[row][col].indexOf('v') !== -1){ //check spaces to right
				for (var i=1; i<length; i++){
					if (grid[row][col+i] !== 0){
						return false;
					}
				}
			} else { //check spaces below
				for (var j=1; j<length; j++){
					try{
						if (grid[row+j][col] !== 0){
							return false;
						}
					} catch(e) {
						return false;
					}
				}
			}
			return true;
		}

		//CANROTATELEFT: takes in cell coordinates of ship segment 0 and ship name
		//returns true if (lengthOfShip - 1) spaces to left of segment 0 are empty
		function canRotateLeft(grid, row, col, ship){
			var length = ship.charAt(4);
			if (grid[row][col].indexOf('v') !== -1){ //check spaces to left
				for (var i=1; i<length; i++){
					if (grid[row][col-i] !== 0){
						return false;
					}
				}
			}
			return true;
		}
	});
}
