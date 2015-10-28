/* A perceptron neural network with only an input and output layer */
var Perceptron = function(weights, numInputs, numOutputs, bias) {
	//inherit from Network
	Network.call(this, "perceptron", weights, numInputs, numOutputs);
	this.bias = bias || 0.5;
}

// get Networks methods and extend with more methods
Perceptron.prototype = Object.create(Network.prototype);
Perceptron.prototype.constructor = Perceptron;

Perceptron.prototype.feedforward = function(sensorInput) {

	var outputs = Array.apply(null, {length: this.numOutputs})
		.map(function() {return 0;});

	// send in the sensor input to the middle layer or the output layer
	sensorInput.forEach(function (input, i) {
		for(var j=0; j<this.numOutputs; j++) {
			outputs[j] += input * this.weights[i + j*this.numInputs]; // the first five weights belongs to the first sensor etc
		}
	}, this);

	// apply bias to every output and the step function
	outputs = outputs.map(function (output){
		return this.stepFunction(output, this.bias);
	}, this);

	return outputs;
}
