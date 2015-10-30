/*
 * A recurrent neural network.
 * A recurrent network has a number of hidden neurons in the same
 * layer as the output. the output of these neurons is then reused as input
 * in the next frame.
 */
var Recurrent = function(weights, numInputs, numHidden, numOutputs, bias) {
	//inherit from Network
	Network.call(this, "recurrent", weights, numInputs, numOutputs);
	this.previousOutput = Array.apply(null, {length: numHidden + numOutputs})
		.map(function() {return 0;});
	this.numHidden = numHidden;
	this.bias = bias || 0;
}

// get Networks methods and extend with more methods
Recurrent.prototype = Object.create(Network.prototype);
Recurrent.prototype.constructor = Recurrent;

Recurrent.prototype.feedforward = function(sensorInput) {
	// input is both the sensors input and the precious output of all neurons
	var inputs = sensorInput.concat(this.previousOutput);

	var neurons = Array.apply(null, {length: this.numHidden + this.numOutputs})
		.map(function() {return 0;});
	var outputs = Array.apply(null, {length: this.numOutputs})
		.map(function() {return 0;});
	inputs.forEach(function (input, i) {
		for(var j=0; j<neurons.length; j++) {
			// the first five weights belongs to the first sensor etc
			neurons[j] += input * this.weights[i + j*inputs.length];
		}
	}, this);


	// apply a sigmoidal activation function to all hidden layer outputs
	neurons = neurons.map( function (output){ return this.sigmoid(output, this.bias)}, this);
	this.previousOutput = neurons;
	outputs = outputs.map(function (output,i){ return (neurons[i] > 0.5) ? 1 : -1}, this);
	return outputs;
}
