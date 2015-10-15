var AgentFactory = function (game) {
	this.game = game;
};

AgentFactory.prototype.createAgent = function(options) {
	var numWeights;
	var numInputs = options.numInputs;
	var theDNA;
	var brain;
	if(options['type'].toLowerCase() == "perceptron"){
		numWeights = options.numInputs * options.numOutputs;
		theDNA = new DNA(numWeights);
		brain = new Perceptron(theDNA.genes, options.numInputs, options.numOutputs);
	} else if(options['type'].toLowerCase() == "mlp"){
		numWeights = options.numInputs*options.numHidden + options.numHidden*options.numOutputs;
		theDNA = new DNA(numWeights);
		brain = new MLP(theDNA.genes, options.numInputs, options.numHidden, options.numOutputs);
	} else if(options['type'].toLowerCase() == "recurrent"){
		// numWeights = all inputs * all outputs
		numWeights = (options.numInputs + options.numHidden + options.numOutputs) * (options.numOutputs + options.numHidden);
		theDNA = new DNA(numWeights);
		brain = new Recurrent(theDNA.genes, options.numInputs, options.numHidden, options.numOutputs);
	}
	else if(options['type'].toLowerCase() == "existing") {

		var tempBrain = options['brain'];
		var genes = tempBrain.weights;

		if(tempBrain.brainType == "perceptron") {
			brain = new Perceptron(genes, tempBrain.numInputs, tempBrain.numOutputs);
		}
		else if(tempBrain.brainType == "mlp") {
			brain = new MLP(genes, tempBrain.numInputs, tempBrain.numHidden, tempBrain.numOutputs);
		}
		else if(tempBrain.brainType == "recurrent") {
			brain = new Recurrent(genes, tempBrain.numInputs, tempBrain.numHidden, tempBrain.numOutputs);
		}
		theDNA = new DNA(tempBrain.numWeights);
		theDNA.setGenes(genes);
		numInputs = brain.numInputs;
	}

	return new Mover(
		this.game,
		theDNA,
		brain,
		numInputs, // number of sensors
		800*Math.random(),
		600*Math.random()
	);
};

