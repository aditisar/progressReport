var session = function(name){
	return {
		name: name,
		p1: "",
		p2: ""
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

module.exports = session;
