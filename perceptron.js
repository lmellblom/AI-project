// ========================== A simple neural network ==========================
var Perceptron = function(weights, c) {
	// local variabels
	this.c = c; // learning constants
	this.weights = weights;

}

Perceptron.prototype.updateWeights = function(weights_) {
	this.weights = weights_;
}

Perceptron.prototype.feedforward = function(sensorInput) {
	var output = [0, 0];
	sensorInput.forEach(function (input, i) {
		output[0] += input * this.weights[i];
		output[1] += input * this.weights[i+5];
	}, this);
	//bias
	output[0] += 0.5;
	output[1] += 0.5;
	output[0] = (output[0] > 0) ? 1 : -1;
	output[1] = (output[1] > 0) ? 1 : -1;
	// output => array with 2 values (1/0)
	return output;
}
