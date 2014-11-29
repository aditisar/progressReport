var app = require('../server');

//index is the home page
exports.index = function(req, res) {
  res.render('index')
};

//setgoal is where the user inputs their own goal
exports.setGoal = function(req, res) {
	res.render('setGoal')
}

//confirm is the page where we wait for the other person to join
exports.confirm = function(req, res) {
	res.render('confirm')
}

//go is the page where the timer actually counts down and where they can chat
exports.go = function(req, res) {
	res.render('go')
}