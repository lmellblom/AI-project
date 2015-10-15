var Population = function (game, size) { 	// IMPORTANT, as of now "generation" only sets the "generationNr" 
	this.numMovers = size;								// we have not yet implementet a way to skip through generations
	this.generationNr = 1;
	this.groupMover = game.add.group();
	this.groupMover.enableBody = true;
	this.alivePopulationSize = size;
	this.groupMover.physicsBodyType = Phaser.Physics.ARCADE;
	this.game = game; // keep a reference to the game
	this.elitism = 0.1; // 15 percent of the population size will move straight to the next generation!
	this.championNumber = Math.ceil(this.numMovers*this.elitism); 
	this.championDNA = [];
	for(var i = 0; i < this.championNumber; i++){
			this.championDNA[i] = new DNA(1);
	}

	// one timer on the whole population?
	this.timer = 0;

	// add population text top of screen
	var style = { font: "20px Times", fill: "#000", align: "right" };
	this.popNumber = this.game.add.text(this.game.world.width - 120, 20, "Generation " +this.generationNr, style);
};

Population.prototype.initPopulation = function(options) {
	var agentFactory = new AgentFactory(this.game);
	this.groupMover.addMultiple(
		Array.from(new Array(this.numMovers), () => agentFactory.createAgent(options) )
	);
	this.sortPopulation();

	console.log(this.groupMover);

	// start the timer
	/*this.game.time.events.loop(Phaser.Timer.QUARTER, function(){
		// add more to the timer
		this.timer++;
	}, this);*/
};

// the sort population function needs to be done before this!
Population.prototype.bestMover = function() {
	return this.groupMover.children[0];
};

// This function will move everything depending on the obstacles/target to sense
Population.prototype.update = function(obstacles, targets, dt) {
	this.groupMover.forEachAlive( (mover)=>{
		// gets an array of values (1/0) which indicates how that sensor has sensed the environment.
		// 1 = obstacle, 0 = no obstacle
		var brainInput = mover.senseEnvironment(obstacles, targets);
		mover.move(dt, brainInput);
	});

	this.timer++;
};

Population.prototype.nextPopulation = function() {
	var matingPool = []; // holdes all the DNA of the indivuals to mate

	// Elitism, This is the number of individuals that will go straight to the next generation
	var elitismNumber = Math.ceil(this.numMovers*this.elitism);
	//console.log("how many? " + elitismNumber);
	var prevGeneration;
	var sumFitness = 0;
	var sumProb = 0;
	// sum up the fitness from every individ
	this.groupMover.forEach(function(individual){
		sumFitness += individual.DNA.fitness;
	});
	//console.log("Best fitness" + this.groupMover.children[0].DNA.fitness);
	this.groupMover.forEach(function(individual){
		var prob = sumProb + (individual.DNA.fitness/sumFitness);
		sumProb += prob; // prob To

		matingPool.push(sumProb);
	});
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
		this.groupMover.children[i].DNA = (i <elitismNumber + this.championNumber) ? this.championDNA[i-elitismNumber] : billybob;
	}
};

// not used at the moment! if we want it to die or not at the walls.
Population.prototype.checkBoundary = function() {
	this.groupMover.forEachAlive(function(mover) {
		if( mover.pos.x > this.game.world.width ||
		mover.pos.x < 0 || mover.pos.y > this.game.world.height ||
		mover.pos.y < 0){
			this.alivePopulationSize--; 
			mover.died();
			mover.setFitness(this.timer);
			mover.isAlive = false;
			mover.kill();
		}
	}, this);
}
// All individuals constantly fight for a position in the hall of fame
// Only the most fit and muscular gain entrance
Population.prototype.hallOfFame = function() {
	this.groupMover.forEach(function(individual){
		for(var i = 0; i < this.championNumber; i++){
			if(individual.DNA.fitness > this.championDNA[i].fitness ){
				//console.log(individual.DNA.fitness + " hello " + this.championDNA[i].fitness);
				this.championDNA[i].fitness = individual.DNA.fitness;
				this.championDNA[i].genes = individual.DNA.genes;
			
				this.sortChampions();
				break;
			}
		}			
	},this);
	//for(var i = 0; i < this.championNumber; i++){
	//	console.log(this.championDNA[i].fitness);
	//	console.log( "genes " + this.championDNA[i].genes);
	//}
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
	mover.targetsCollected += 1
	target.x = 800 * Math.random();
	target.y = 600 * Math.random();
	//target.kill(); // hmmm. eller ska man flytta på den bara till en ny plats kanske?
	// set + på movern, eftersom den får något extra då i fitness kanske?
};

Population.prototype.sortPopulation = function() {
	this.groupMover.children.sort(function(a,b){
		return b.DNA.fitness - a.DNA.fitness;
	});
};

Population.prototype.sortChampions = function() {
	this.championDNA.sort(function(a,b){
		return a.fitness - b.fitness;
	});
};

Population.prototype.revivePopulation = function() {
	this.generationNr++;

	// sort the population according to the fitness value, to use elitism
	//console.log("the old population = " + this.groupMover.children);
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
		mover.setRandomPosition();
		mover.revive(); // make the sprite alive again
	});

	//console.log("the new population = " + this.groupMover.children);

	this.timer = 0;	// reset the timer
	//console.log("Generationnr "+ this.generationNr);
	this.popNumber.text =  "Generation " + this.generationNr;
};

