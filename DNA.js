// global variables. BUT WHYYY
var mutationRate = 0.1;
var mutationSigma = 0.2;

var DNA = function(numGenes) {
	this.genes = this.randomGenes(numGenes);
	this.fitness = 0;
};

DNA.prototype.setFitness = function(fitness_) {
	this.fitness = fitness_;
};

DNA.prototype.randomGenes = function(n) {
	var genes = [];
	for (var i=0; i<n; i++) {
		genes[i] = getRandom(-1,1);
	}
	return genes;
};

DNA.prototype.setGenes = function(genes_) {
	this.genes = genes_;
};

DNA.prototype.print = function() {
//	debug(this.genes);
}
DNA.prototype.mutate = function() {
	for (var i=0; i<this.genes.length-1; i++) {
		if(mutationRate > Math.random()) {
			// if over mutationrate, add something here?
			this.genes[i] = this.genes[i] + getRandom(-1.0*mutationSigma, 1.0*mutationSigma);

			// make sure that the genes stays between -1 and 1
			if(this.genes[i]>1) {
				var over = this.genes[i]-1;
				this.genes[i] = this.genes[i]-2*over;
			}
			else if (this.genes[i]< -1) {
				var under = this.genes[i]+1;
				this.genes[i] = this.genes[i]-2*under;
			}
		}
	}
}

// function that takes two parents and return one child
DNA.crossover = function(billy, bob, crossoverType) {
	var newGenes = [];
	var i;
	if(crossoverType === undefined || crossoverType === 'split'){
		/*   INDEX CUTOFF  */
		var crossIndex = Math.floor(getRandom(1,bob.genes.length-2));
		for (i=0; i<crossIndex; i++){
		newGenes[i] = billy.genes[i];
		}
		for(; i<bob.genes.length; i++) {
			newGenes[i] = bob.genes[i];
		}
	} else if(crossoverType === 'average') {
		/*   AVERAGE  */
		for (i=0; i<bob.genes.length; i++){
			newGenes[i] = (billy.genes[i]+bob.genes[i])/2.0;

		}
	} else if(crossoverType === 'uniform') {
		// randomize number between 0.25 - 0.75.
		var crossProbability = 0.25 + Math.random()*0.5;
		// Use crossprobability to decide whether to choose weight from billy och bob
		for (i=0; i<bob.genes.length; i++){
			newGenes[i] = (crossProbability>Math.random()) ? billy.genes[i] : bob.genes[i];
		}
	}

	var billybob = new DNA(1);
	billybob.setGenes(newGenes);
	return billybob;
};