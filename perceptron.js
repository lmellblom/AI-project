// ========================== A simple neural network ==========================
var Perceptron = function(setWeights, c) {
	// local variabels
	this.weights = new Array(setWeights.length); // creates an array with undefined elements
	this.c = c; // learning constants

	// fill the weights 
	for (var i = 0; i < setWeights.length; i++) {
		this.weights[i] = setWeights[i];//getRandom(-1,1); 
	}

}
// need an vector as an input! 
// NOTE : if the number of weights is larger than number of forces it will crash....
// felmeddelandet kommer se ut ngt liknande : "Uncaught TypeError: Cannot read property 'clone' of undefined ""
Perceptron.prototype.feedforward = function(forces) {
	var sum = new Victor(0.0,0.0);

	for (var i=0; i<this.weights.length; i++){
		var f = forces[i].clone();
		f.multiplyScalar(this.weights[i]);
		sum.add(f);
	}

	return sum;
}

// not used at the moment.. maybe  use later
Perceptron.prototype.train = function(forces, error) { // provide the inputs as an array and the desired ouput as an float
	// adjust the weight according to the error and learning constant. newW = w + dW, där dW = error*input
	for (var i = 0; i < this.weights.length; i++) {
		this.weights[i] += this.c * error.x * forces[i].x;
		this.weights[i] += this.c * error.y * forces[i].y; 
	}
}