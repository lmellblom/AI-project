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

		// Variables for the brain
		var tempBrain = options['brain'];
		var genes = tempBrain.weights;
		var bias = tempBrain.bias;
		numInputs = tempBrain.numInputs;
		var numHidden = tempBrain.numHidden;
		var numOutputs = tempBrain.numOutputs;

		// Which brain to create
		if(tempBrain.brainType == "perceptron") {
			brain = new Perceptron(genes, numInputs, numOutputs, bias);
		}
		else if(tempBrain.brainType == "mlp") {
			brain = new MLP(genes, numInputs, numHidden, numOutputs, bias);
		}
		else if(tempBrain.brainType == "recurrent") {
			brain = new Recurrent(genes, numInputs, numHidden, numOutputs, bias);
		}
		theDNA = new DNA(numWeights);
		theDNA.setGenes(genes);
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

