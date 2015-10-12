var AgentFactory = function (game) {
	this.game = game;
};

AgentFactory.prototype.createAgent = function(options) {
	var numWeights;
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

	return new Mover(
		this.game,
		theDNA,
		brain,
		options.numInputs, // number of sensors
		800*Math.random(),
		600*Math.random()
	);
};

