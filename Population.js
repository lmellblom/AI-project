var Population = function (game, size) { 	// IMPORTANT, as of now "generation" only sets the "generationNr"
	this.numMovers = size;					// we have not yet implementet a way to skip through generations
	this.generationNr = 1;
	this.groupMover = game.add.group();
	this.alivePopulationSize = size;
	this.game = game; // keep a reference to the game
	this.elitism = 0.1; // 15 percent of the population size will move straight to the next generation!
	this.championRatio = 0.05;
	this.championNumber = Math.ceil(this.numMovers*this.championRatio);
	this.championDNA = [];
	this.crossoverType = 'uniform';
	for(var i = 0; i < this.championNumber; i++){
			this.championDNA[i] = new DNA(1);
	}

	// one timer on the whole population?
	this.timer = 0;

	this.selectionType = "rank";

	this.averageFitness = [];
	this.bestFitness = [];

	// add population text top of screen
	var style = { font: "20px Times", fill: "#000", align: "right" };
	document.getElementById("genNumber").innerHTML = this.generationNr;
};

Population.prototype.initPopulation = function(options) {
	var agentFactory = new AgentFactory(this.game);
	this.groupMover.addMultiple(
		Array.apply(null, {length: this.numMovers})
			.map(function(object, i) {return agentFactory.createAgent(options, i);})
	);
	this.sortPopulation();
};


Population.prototype.checkCollision = function(targets, obstacles) {

	//Check if collisions
	this.groupMover.forEachAlive(function (mover) {

		var moverRadius = mover.r;

		obstacles.forEach(function (obstacle) {

			var obstacleRadius = obstacle.radius;
			var dist = mover.pos.distanceSq(obstacle.position);

			if(dist < ((moverRadius+obstacleRadius)*(moverRadius+obstacleRadius))) {
				this.moverCollided(obstacles, mover);
			}
		}, this);

		targets.forEach(function (target) {

			var targetRadius = target.radius;
			var dist = mover.pos.distanceSq(target.position);

			if(dist < (moverRadius+targetRadius)*(moverRadius+targetRadius)) {
				this.foundTarget(target, mover);
			}
		}, this);

	}, this);
};
// the sort population function needs to be done before this!
Population.prototype.bestMover = function() {
	return this.groupMover.children[0];
};

// This function will move everything depending on the obstacles/target to sense
Population.prototype.update = function(obstacles, targets, stage, dt) {
	this.groupMover.forEachAlive(function (mover) {
		// gets an array of values (1/0) which indicates how that sensor has sensed the environment.
		// 1 = obstacle, 0 = no obstacle
		var brainInput = mover.senseEnvironment(obstacles, targets, stage);
		mover.move(dt, brainInput);
		mover.energy--; // the energy should go down when the mover is moving. 

		// the mover should die if the energy have run out
		if(mover.energy<=0){
			this.alivePopulationSize--;
			mover.die(); 				// do something meaningfull in the mover?
			mover.setFitness(this.timer); 	// will set how long it survived. 
		}
	}, this);

	this.timer++;
};

Population.prototype.rouletteWheelSelection = function() {
	// builts up the mating pool for the roulette wheel selection
	var matingPool = [];
	var sumFitness = 0;
	var sumProb = 0;
	
	// sum up the fitness from every individ
	this.groupMover.forEach(function(individual){
		sumFitness += individual.DNA.fitness;
	});
	this.groupMover.forEach(function(individual){
		var prob = sumProb + (individual.DNA.fitness/sumFitness);
		sumProb += prob; // prob To

		matingPool.push(sumProb);
	});

	return matingPool;
};

Population.prototype.rankSelection = function() {
	// the probability is based on which rank the individual has (ex 1, 2,3 etc.)
	// divide the spinning wheel accoring to rank. 
	var matingPool = [];
	var numbers = this.groupMover.children.length;  // how many in the population

	var sumOfRank = 0;
	for(var i=1; i<=numbers; i++){
		sumOfRank+=i;
	}

	var probBefore = 0;
	for(var index = 0, i=numbers; index < numbers; index++, i--) {
		matingPool[index] = probBefore +  (i/sumOfRank);
		probBefore = matingPool[index];
	}

	return matingPool;
};

Population.prototype.calcAverageFitness = function () {
	var sumFitness = 0;
	var average = 0;
	
	// sum up the fitness from every individ
	this.groupMover.forEach(function(individual){
		sumFitness += individual.DNA.fitness;
	});

	average = sumFitness / this.groupMover.children.length;
	this.averageFitness.push(average);
	
	console.log(average);
}


Population.prototype.nextPopulation = function() {
	var matingPool = []; // holds the wheel percentage of the selection method.

	// get the average of the population and push it to a list
	this.calcAverageFitness(); 
	this.bestFitness.push(this.bestMover().DNA.fitness);

	// Elitism, This is the number of individuals that will go straight to the next generation
	var elitismNumber = Math.ceil(this.numMovers*this.elitism);
	var prevGeneration;

	// builts upp mating pool based on which metod to use.
	var matingPool = this.selectionType == "rank" ? this.rankSelection() : this.rouletteWheelSelection();
	
	this.hallOfFame();
	prevGeneration = this.groupMover.children;

	for (var i=elitismNumber; i<prevGeneration.length; i++) {
		// get two random parents

		var parents = [];
		var nr1 = Math.random();
		var nr2 = Math.random();

		for (var index=0; index< prevGeneration.length;index++) {
			if( nr1 < matingPool[index]  ) {
				parents[0] =prevGeneration[index];
				break;
			}
		}
		for (var index=0; index< this.groupMover.length;index++) {
			if( nr2 < matingPool[index]  ) {
				parents[1] = prevGeneration[index];
				break;
			}
		}

		var billy = parents[0];
		var bob = parents[1];
		// new child

		var billybob = DNA.crossover(billy.DNA, bob.DNA, this.crossoverType); // returns a new DNA
		billybob.mutate();

		if(i <elitismNumber + this.championNumber){
			DNAcopy = new DNA(1);
			DNAcopy.fitness = this.championDNA[i-elitismNumber].fitness;
			DNAcopy.genes = this.championDNA[i-elitismNumber].genes;
			this.groupMover.children[i].DNA = DNAcopy;
		}
		else {
			this.groupMover.children[i].DNA = billybob;
		}
	}
};

//  if we want it to die or not at the walls.
Population.prototype.checkBoundary = function(stage) {

	stage.forEach(function (wall) {
		var n = wall.wallVector // normalized vector in the direction of line
			.clone()
			.norm();
		this.groupMover.forEachAlive(function (mover) {
			var projectedVector = projectPointOnLine(mover.pos, wall.wallPoint, n);
			if(projectedVector.length() < mover.r + wall.thickness){
				this.alivePopulationSize--;
				mover.die();
				mover.setFitness(this.timer);
			}
		}, this);
	}, this);
}
// All individuals constantly fight for a position in the hall of fame
// Only the most fit and muscular gain entrance
Population.prototype.hallOfFame = function() {
	this.groupMover.forEach(function(individual){
		for(var i = 0; i < this.championNumber; i++){

			if(individual.DNA.fitness > this.championDNA[i].fitness ){
				this.championDNA[i].fitness = individual.DNA.fitness;
				this.championDNA[i].genes = individual.DNA.genes.slice();

				this.sortChampions();
				break;
			}
		}
	},this);
}

Population.prototype.getGroup = function() {
	return this.groupMover;
}

// the mover died! collided with an obstacle
Population.prototype.moverCollided = function(obstacles, mover) {
	this.alivePopulationSize--;
	mover.die(); 				// do something meaningfull in the mover?
	mover.setFitness(this.timer); 		// will set how long it survived.
};

Population.prototype.foundTarget = function(target, mover) {
	target.setRandomPosition();
	mover.energy += 60*3; // adds 3 seconds to the energy if have eaten
	mover.energy = mover.energy > mover.surviveTime ? mover.surviveTime : mover.energy;
};

Population.prototype.sortPopulation = function() {
	this.groupMover.children.sort(function(a,b){
		return b.DNA.fitness - a.DNA.fitness;
	});
};
// Read population from text field
Population.prototype.addMover = function(mover) {

	// Config for creating new agent/mover
	var existingAgentConfig = {
			'type': 'existing',
			'DNA': mover.DNA,
			'brain': mover.brain
	}

	// Create a new Mover and add to groupMover
	var agentFactory = new AgentFactory(this.game);
	var tempMover = agentFactory.createAgent(existingAgentConfig);
	//Kill the mover
	tempMover.die();
	this.groupMover.add(tempMover);

	//Update number of Movers
	this.numMovers++; //Adds to number of movers

	// Some information about the new Mover
	console.log("Brain type: " + tempMover.brain.brainType);
	console.log("Bias " + tempMover.brain.bias);
	console.log("Hidden layers: " + tempMover.brain.numHidden);
	console.log("Fitness: " + tempMover.DNA.fitness);

};

Population.prototype.sortChampions = function() {
	this.championDNA.sort(function(a,b){
		return a.fitness - b.fitness;
	});
};

Population.prototype.revivePopulation = function() {
	this.generationNr++;

	// sort the population according to the fitness value, to use elitism
	this.sortPopulation();
	this.nextPopulation();
	this.alivePopulationSize = this.numMovers; // make the population large again

	// need to update a couple of thing to the mover..
	var index = 0;
	this.groupMover.forEach(function(mover){
		// need to reset it to alive!!
		mover.isAlive = true;
		//mover.targetsCollected = 0;
		mover.updateBrain(); // update the brains weights
		// need to set the x and y pos to new values?
		mover.setStartPosition(index);
		mover.revive(); // make the sprite alive again
		index++;
	});

	this.timer = 0;	// reset the timer
	document.getElementById("genNumber").innerHTML = this.generationNr;
};
