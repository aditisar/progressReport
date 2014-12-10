var comment = function(name, comment){
	return {
		name: name,
		comment: comment
	}
}

session.prototype.getName = function(){
	return this.name;
}
session.prototype.getp1 = function(){
	return this.p1;
}
session.prototype.getp2 = function(){
	return this.p2;
}
session.prototype.toString = function(){ 
	return "Name: " + this.name + " P1: " + this.p1 + "P2: " + this.p2;
}

module.exports = comment;