
exports.agent = function(req){
	var deviceAgent = req.headers["user-agent"].toLowerCase();
	var agentID = deviceAgent.match(/(iphone|ipod|ipad|android)/);
	return agentID?"mobile":"pc";
}

