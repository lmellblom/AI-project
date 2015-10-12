/* Artificial Neural Network Baseclass */
var Network = function(weights, numInputs, numOutputs) {
	// local variabels
	this.weights = weights;
	this.numInputs = numInputs;
	this.numOutputs = numOutputs;
}

Network.prototype.updateWeights = function(weights_) {
	this.weights = weights_;
}
Network.prototype.sigmoid = function(sum, threshhold) {
	return (1 / (1 + Math.pow(Math.E, -1*(sum + threshhold))));
}
Network.prototype.bipolarSigmoid = function(sum, threshhold) {
	return (2 / (1 + Math.pow(Math.E, -1*(sum + threshhold)))) - 1;
}
Network.prototype.stepFunction = function(sum, threshhold) {
	return ((sum + threshhold)>0) ? 1 : -1;
}
Network.prototype.feedforward = function(sensorInput) {
	throw new Error('feedforward method needs to be overridden in subclass');
}
