/*
 * A multi-layer perceptron neural network.
 * This implementation only allows 1 hidden layer though
 */
var MLP = function(weights, numInputs, numHidden, numOutputs, bias) {
	//inherit from Network
	Network.call("mlp", this, weights, numInputs, numOutputs);
	this.numHidden = numHidden;
	this.bias = bias || 0.5;
}

// get Networks methods and extend with more methods
MLP.prototype = Object.create(Network.prototype);
MLP.prototype.constructor = MLP;

MLP.prototype.feedforward = function(sensorInput) {

	var outputsHidden = Array(this.numHidden).fill(0);
	var outputs = Array(this.numOutputs).fill(0);

	// send in the sensor input to the hidden layer
	sensorInput.forEach(function (input, i) {
		for(var j=0; j<this.numHidden; j++) {
			// the first five weights belongs to the first sensor etc
			outputsHidden[j] += input * this.weights[i + j*this.numInputs];
		}
	}, this);

	// apply a sigmoidal activation function to all hidden layer outputs
	outputsHidden = outputsHidden.map((hiddenOutput) => this.sigmoid(hiddenOutput, this.bias));

	// feedforward the middle layer to the output layer
	var startWeight = this.numInputs * this.numHidden;

	// send in the middle layer output to the output layer
	outputsHidden.forEach(function (input, i) {
		for(var j=0; j<this.numOutputs; j++) {
			var weightIndex = startWeight + i +j*this.numHidden;
			outputs[j] += input * this.weights[weightIndex];
		}
	}, this);

	outputs = outputs.map((output) => this.stepFunction(output, this.bias));
	return outputs;
}
