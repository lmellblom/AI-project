var Population = function (game, size) { 	// IMPORTANT, as of now "generation" only sets the "generationNr" 
	this.numMovers = size;								// we have not yet implementet a way to skip through generations
	this.generationNr = 1;
	this.groupMover = game.add.group();
	//this.groupMover.enableBody = true;
	this.alivePopulationSize = size;
	//this.groupMover.physicsBodyType = Phaser.Physics.ARCADE;
	this.game = game; // keep a reference to the game
	this.elitism = 0.1; // 15 percent of the population size will move straight to the next generation!
	this.championRatio = 0.1;
	this.championNumber = Math.ceil(this.numMovers*this.championRatio); 
	this.championDNA = [];
	for(var i = 0; i < this.championNumber; i++){
			this.championDNA[i] = new DNA(1);
	}

	// one timer on the whole population?
	this.timer = 0;

	this.selectionType = "rank";

	// add population text top of screen
	var style = { font: "20px Times", fill: "#000", align: "right" };
	this.popNumber = this.game.add.text(this.game.world.width - 140, 20, "Generation " +this.generationNr, style);
	document.getElementById("numberPop").innerHTML =this.numMovers;
	document.getElementById("genNumber").innerHTML = this.generationNr;
};

Population.prototype.initPopulation = function(options) {
	var agentFactory = new AgentFactory(this.game);
	this.groupMover.addMultiple(
		Array.from(new Array(this.numMovers), () => agentFactory.createAgent(options) )
	);
	this.sortPopulation();
};


Population.prototype.checkCollision = function(targets, obstacles) {

	//Check if collisions
	this.groupMover.forEachAlive( (mover) => {

		var moverRadius = mover.r;

		obstacles.forEach( (obstacle)=> {

			var obstacleRadius = obstacle.radius;
			var dist = mover.pos.distanceSq(obstacle.position);

			if(dist < ((moverRadius+obstacleRadius)*(moverRadius+obstacleRadius))) {
				this.moverCollided(obstacles, mover);
			}
		});

		targets.forEach( (target)=> {

			var targetRadius = target.radius;
			var dist = mover.pos.distanceSq(target.position);	

			if(dist < (moverRadius+targetRadius)*(moverRadius+targetRadius)) {
				this.foundTarget(target, mover);
			}
		});

	});
};
// the sort population function needs to be done before this!
Population.prototype.bestMover = function() {
	return this.groupMover.children[0];
};

// This function will move everything depending on the obstacles/target to sense
Population.prototype.update = function(obstacles, targets, stage, dt) {
	this.groupMover.forEachAlive( (mover)=>{
		// gets an array of values (1/0) which indicates how that sensor has sensed the environment.
		// 1 = obstacle, 0 = no obstacle
		var brainInput = mover.senseEnvironment(obstacles, targets, stage);
		mover.move(dt, brainInput);
	});

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


Population.prototype.nextPopulation = function() {
	var matingPool = []; // holdes all the DNA of the indivuals to mate

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

		var billybob = DNA.crossover(billy.DNA,bob.DNA); // returns a new DNA
		billybob.mutate();

		//check if champion already has been added through elitism
		//if(this.championDNA[i].fitness == elitism){
		
		//}
		// NEED to reset the current pop, just overwrite the DNA at the moment.
		// need to reset fitness, isAlive = true, update brain? etc.. maybe not do this..

		if(i <elitismNumber + this.championNumber){
			DNAcopy = new DNA(1);
			DNAcopy.fitness = this.championDNA[i-elitismNumber].fitness;
			DNAcopy.genes = this.championDNA[i-elitismNumber].genes;
			
			this.groupMover.children[i].DNA = DNAcopy;
		}
		else
			this.groupMover.children[i].DNA = billybob;
		//this.groupMover.children[i].DNA = (i <elitismNumber + this.championNumber) ? DNAcopy : billybob;
	}
};

//  if we want it to die or not at the walls.
Population.prototype.checkBoundary = function(stage) {

	stage.forEach((wall) => {
		var n = wall.wallVector // normalized vector in the direction of line
			.clone()
			.norm();
		this.groupMover.forEachAlive((mover) => {
			var projectedVector = projectPointOnLine(mover.pos, wall.wallPoint, n);
			if(projectedVector.length() < mover.r + wall.thickness){
				this.alivePopulationSize--;
				mover.died();
				mover.setFitness(this.timer);
				mover.isAlive = false;
				mover.kill();
			}
		});
	});
}
// All individuals constantly fight for a position in the hall of fame
// Only the most fit and muscular gain entrance
Population.prototype.hallOfFame = function() {
	this.groupMover.forEach(function(individual){
		for(var i = 0; i < this.championNumber; i++){

			if(individual.DNA.fitness > this.championDNA[i].fitness ){
				//console.log("contender: "+individual.DNA.fitness+" champion: "+this.championDNA[i].fitness);
				this.championDNA[i].fitness = individual.DNA.fitness;
				this.championDNA[i].genes = individual.DNA.genes.slice();
			
				this.sortChampions();
				break;
			}
		}			
	},this);
	//console.log("our current champions:");
/*	for(var i = 0; i < this.championNumber; i++){
		console.log(this.championDNA[i].fitness);
	}*/
}

Population.prototype.getGroup = function() {
	return this.groupMover;
}

// the mover died! collided with an obstacle
Population.prototype.moverCollided = function(obstacles, mover) {
	this.alivePopulationSize--;
	mover.died(); 				// do something meaningfull in the mover?
	mover.setFitness(this.timer); 		// will set how long it survived. 
	mover.isAlive = false;
	mover.kill();				// kill sprite
};

Population.prototype.foundTarget = function(target, mover) {
	//console.log("YOU FOUND A TARGET! WOW");
	mover.targetsCollected += 1;
	target.setRandomPosition();
	//target.kill(); // hmmm. eller ska man flytta på den bara till en ny plats kanske?
	// set + på movern, eftersom den får något extra då i fitness kanske?
};

Population.prototype.sortPopulation = function() {
	this.groupMover.children.sort(function(a,b){
		return b.DNA.fitness - a.DNA.fitness;
	});
};
// Read population from text field
Population.prototype.addPopulation = function() {

	// Read agent/mover from textfield
	try {
		var mover = JSON.parse(document.getElementById("insertDNA").value);
		
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
		tempMover.died();
		tempMover.isAlive = false;
		tempMover.kill();
		this.groupMover.add(tempMover);

		//Update number of Movers
		this.numMovers++; //Adds to number of movers
		document.getElementById("numberPop").innerHTML = this.numMovers;

		// Some information about the new Mover
		console.log("Brain type: " + tempMover.brain.brainType);
		console.log("Bias " + tempMover.brain.bias);
		console.log("Hidden layers: " + tempMover.brain.numHidden);
		console.log("Fitness: " + tempMover.DNA.fitness);
		}
		catch(err) {
			console.log("Error while reading mover: "+ err.message);
		}

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
	this.groupMover.forEach(function(mover){
		// need to reset it to alive!!
		mover.isAlive = true;
		//mover.targetsCollected = 0;
		mover.updateBrain(); // update the brains weights
		// need to set the x and y pos to new values?
		mover.setPositionInMiddle();
		mover.revive(); // make the sprite alive again
	});

	this.timer = 0;	// reset the timer
	this.popNumber.text =  "Generation " + this.generationNr;
	document.getElementById("genNumber").innerHTML = this.generationNr;
};