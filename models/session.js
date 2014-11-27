var user = function(name, color, size){
	return {
		username: name,
		description: description,
	}
}

user.prototype.getName = function(){
	return this.name;
}
user.prototype.getDescription = function(){
	return this.description;
}
user.prototype.toString = function(){
	return "Name: " + this.name + " Description: " + this.description;
}

module.exports = user;
