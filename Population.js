var alivePopulationSize = 200;  // samma som numMovers..

var Population = function (game) {
	this.numMovers = 200;
	this.generationNr = 1;

	this.groupMover = game.add.group();
	this.groupMover.enableBody = true;
	this.groupMover.physicsBodyType = Phaser.Physics.ARCADE;
};

Population.prototype.movePopulation = function(obstacles, groupTarget) {
	this.groupMover.forEachAlive((mover) => {
		// gets an array of values (1/0) which indicates how that sensor has sensed the environment.
		// 1 = obstacle
		// 0 = no obstacle
		var brainInput = mover.senseEnvironment(obstacles, groupTarget);
		// Use brainInput as argument to move
		mover.move(dt, brainInput);
	});
};

Population.prototype.initPopulation = function(game) {
	this.groupMover.addMultiple(
		//create array with movers (ES6 way)
		Array.from(new Array(this.numMovers), () => new Mover(
			game,
			new DNA(),
			800*Math.random(),
			600*Math.random()
		))
	);
};

Population.prototype.nextPopulation = function(currentPopulation) {
	var matingPool = []; // holdes all the DNA of the indivuals to mate

	var sumFitness = 0;
	// sum up the fitness from every individ
	currentPopulation.forEach(function(individual){
		sumFitness += individual.DNA.fitness;
	});

	// get percent value.. the roulette wheel selection uses this
	currentPopulation.forEach(function(individual){
		var numberOfIndividuals = Math.ceil(individual.DNA.fitness/sumFitness * 10);

		for (var j=0; j<numberOfIndividuals; j++) {		// add the memeber n times according to fitness score
			matingPool.push(individual.DNA);
		}
	});

	// select from matingpool and fill upp the populations size
	// maybe use elitism later and take the best from currentPop to the next pop
	for (var i=0; i<currentPopulation.length; i++) {
		// get to random parents
		var a = Math.floor(Math.random()*matingPool.length);
		var b = Math.floor(Math.random()*matingPool.length);

		var billy = matingPool[a];
		var bob = matingPool[b];

		// new child
		var billybob = DNA.crossover(billy,bob); // returns a new DNA
		billybob.mutate();

		// NEED to reset the current pop, just overwrite the DNA at the moment.
		// need to reset fitness, isAlive = true, update brain? etc.. maybe not do this..
		currentPopulation.children[i].DNA = billybob;
	}
	return currentPopulation; 
};

// not used at the moment! if we want it to die or not at the walls.
Population.prototype.checkBoundary = function(game, movers) {
	movers.forEachAlive(function(mover) {
		if( mover.pos.x > game.world.width ||
		mover.pos.x < 0 || mover.pos.y > game.world.height ||
		mover.pos.y < 0){
			alivePopulationSize--; 
			mover.died();
			mover.setFitness();
			mover.isAlive = false;
			mover.kill();
		}
	}, this);
}

// the mover died! collided with an obstacle
Population.prototype.badCollisionMover = function(obstacles, mover) {
	
	alivePopulationSize--;
	mover.died(); 				// do something meaningfull in the mover?
	mover.setFitness(); 		// will set how long it survived. 
	mover.isAlive = false;
	mover.kill();				// kill sprite
};

Population.prototype.revivePopulation = function() {
	this.generationNr++;
	this.nextPopulation(this.groupMover);
	alivePopulationSize = this.numMovers; // make the population large again

	// need to update a couple of thing to the mover.. 
	this.groupMover.forEach(function(mover){
		// need to reset it to alive!!
		mover.isAlive = true;
		mover.updateBrain(); // update the brains weights
		// need to set the x and y pos to new values?
		mover.setRandomPosition();
		mover.revive(); // make the sprite alive again
	});
	console.log("Generationnr "+ this.generationNr);
};

