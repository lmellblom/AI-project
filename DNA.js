// ========================== DNA ==========================
var DNA = function(n) {
	this.genes = new Array(n);
	this.fitness = 0;
	// adding random genes

	for (var i=0; i<this.genes.length-1; i++) {
		this.genes[i] = getRandom(-1,1);
	}
	this.genes[this.genes.length-1] = 1;  // adding the last dna as 1??

	this.setFitness = function(nr) {
		this.fitness = nr;
	};

	this.crossover = function (partner) {
		console.log("partner" + partner);
		// ta hälften från denna partner och sen den andra typ..
		var crossIndex = Math.floor(this.genes.length/2);
		var newGenes = new Array();
		var i;

		newGenes[0] = this.genes[0];
		newGenes[1] = partner.genes[1];
		newGenes[2] = partner.genes[2];

		/*for (i=0; i<crossIndex; i++) {
			newGenes[i] = this.genes[i];
		}
		for(var j = i; j<this.genes.length; j++) {
			newGenes[j] = partner.genes[j];
		}*/
		return newGenes;
	};

	this.mutate = function (mutationRate) {
		for (var i=0; i<this.genes.length; i++) {
			this.genes[i] = this.genes[i]; // if over mutationrate, add something here?
		}
	};
}

function mate(population) {
	var matingPool = new Array();
	for (var i=0; i<population.length; i++) {
		//console.log(population[i].DNA);
		var n = Math.ceil(population[i].DNA.fitness * 10) + 1;
		console.log(n);
		for (var j=0; j<n; j++) {		// add the memeber n times according to fitness score
			matingPool.push(population[i].DNA);
		}
	}

	// reproduce the population!! overwrite the population with a new one? 
	for (var i=0; i<population.length; i++) {
		var a = Math.floor(random(0,matingPool.length));
		var b = Math.floor(random(0,matingPool.length));

		var partnerA = matingPool[a];
		var partnerB = matingPool[b];

		// new child.
		var child = partnerA.crossover(partnerB);
		//child.mutate(0.2);

		population[i] = child;
	}

	return population;
}