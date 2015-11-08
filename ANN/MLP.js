/*
 * A multi-layer perceptron neural network.
 * This implementation only allows 1 hidden layer though
 */
var MLP = function(weights, numInputs, numHidden, numOutputs, bias) {
	//inherit from Network
	Network.call(this, "mlp", weights, numInputs, numOutputs);
	this.numHidden = numHidden;
	this.bias = bias || 0.5;
}

// get Networks methods and extend with more methods
MLP.prototype = Object.create(Network.prototype);
MLP.prototype.constructor = MLP;

MLP.prototype.feedforward = function(sensorInput) {

	var outputsHidden = Array.apply(null, {length: this.numHidden})
		.map(function() {return 0;});
	var outputs = Array.apply(null, {length: this.numOutputs})
		.map(function() {return 0;});

	// send in the sensor input to the hidden layer
	sensorInput.forEach(function (input, i) {
		for(var j=0; j<this.numHidden; j++) {
			// the first five weights belongs to the first sensor etc
			outputsHidden[j] += input * this.weights[i + j*this.numInputs];
		}
	}, this);

	// apply a sigmoidal activation function to all hidden layer outputs
	outputsHidden = outputsHidden.map(function (hiddenOutput){
		return this.sigmoid(hiddenOutput, this.bias)
	}, this);

	// feedforward the middle layer to the output layer
	var startWeight = this.numInputs * this.numHidden;

	// send in the middle layer output to the output layer
	outputsHidden.forEach(function (input, i) {
		for(var j=0; j<this.numOutputs; j++) {
			var weightIndex = startWeight + i +j*this.numHidden;
			outputs[j] += input * this.weights[weightIndex];
		}
	}, this);

	outputs = outputs.map(function (output){
		return this.stepFunction(output, this.bias)
	}, this);

	return outputs;
}
