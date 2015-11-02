var AgentFactory = function (game) {
	this.game = game;
};

AgentFactory.prototype.createAgent = function(options, index) {
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
	console.log(index%4);
	var x = (index%2 === 0) ? this.game.world.centerX-300 : this.game.world.centerX+300;
	var y = (index%4 === 0 || index%4 === 1) ? this.game.world.centerY-200 : this.game.world.centerY+200;
	return new Mover(
		this.game,
		theDNA,
		brain,
		numInputs, // number of sensors
		//getRandomInt(40, WIDTH-40),
		//getRandomInt(40, HEIGHT-40)
		x,
		y
	);
};

