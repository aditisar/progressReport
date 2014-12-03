exports.addOmelet = function(request, response) {
	var o = omelet(request.params.name, request.params.color, request.params.size);
    omeletCollection.push(o);
    response.write("Added an omelet named " + request.params.name + " that is " + request.params.color + " in color and " + request.params.size + " bites big. There are " + omeletCollection.length + " omelet(s) total.")
	response.end();
}