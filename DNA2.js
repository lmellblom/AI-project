function getRandom(min, max) { 
	return (Math.random() * (max-min) + min); 
}

// global variables
var mutationRate = 0.2; 

var DNA = function(genes_) {
	this.genes = genes_ || this.randomGenes(5);
	this.fitness = 0;
};

DNA.prototype.randomGenes = function(n) {
	var genes = [];
	for (var i=0; i<n; i++) {
		genes[i] = getRandom(-1,1);
	}
	genes[n] = 1; // bias
	return genes;
};

DNA.prototype.setGenes = function(genes_) {
	this.genes = genes_;
};

DNA.prototype.print = function() {
	debug(this.genes);
}
DNA.prototype.mutate = function() {
	for (var i=0; i<this.genes.length-1; i++) { // the last gene is the bias. should not be mutated
		if(mutationRate > Math.random()) {
			this.genes[i] = this.genes[i] + getRandom(-1,1); // if over mutationrate, add something here?
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
var crossover = function(billy, bob) {
	var crossIndex = Math.floor(getRandom(1,bob.genes.length-2)); 
	var newGenes = [];
	var i;

	for (i=0; i<crossIndex; i++){
		newGenes[i] = billy.genes[i];
	}
	for(var j = i; j<bob.genes.length; j++) {
		newGenes[j] = bob.genes[j];
	}

	var billybob = new DNA(newGenes); 
	return billybob; 
};

var dna = new DNA(); 
var dna2 = new DNA(); 
dna.print();
dna2.print();

var child = crossover(dna, dna2);
child.print();
child.mutate(); 
child.print();


