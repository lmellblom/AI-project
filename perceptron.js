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

	// NRMIDDLELAYERS
	var nrOut = NRMIDDLELAYERS>0 ? NRMIDDLELAYERS : NROUTPUTS; 

	// quick fix to let the middle layer be zer0
	var outMiddle = Array(nrOut).fill(0);

	// send in the sensor input to the middle layer or the output layer
	sensorInput.forEach(function (input, i) {
		for(var j=0; j<nrOut; j++) {
			outMiddle[j] += input * this.weights[i + j*NRSENSORS]; // the first five weights belongs to the first sensor etc
		}
	},this);

	// apply bias to every output and the step function
	for(var j=0; j<nrOut; j++) {
		outMiddle[j] +=0.5;
		outMiddle[j] = (outMiddle[j]>0) ? 1 : -1; 
	}

	// check if we have a middle layer, if not then just return the output
	// otherwise contine
	if(NRMIDDLELAYERS==0)
		return outMiddle;

	// apply the middle layer to the output layer
	var output = Array(NROUTPUTS).fill(0);
	var startWeight = NRSENSORS * NRMIDDLELAYERS; 

	// send in the middle layer output to the output layer
	outMiddle.forEach(function (input, i) {
		for(var j=0; j<NROUTPUTS; j++) {
			var nr = startWeight + i +j*NRMIDDLELAYERS;
			output[j] += input * this.weights[nr];
		}
	}, this);

	// apply bias
	for(var j=0; j<NROUTPUTS; j++) {
		output[j] +=0.5;
		output[j] = (output[j]>0) ? 1 : -1; 
	}

	// output => array with 2 values (1/0)
	return output;
}
