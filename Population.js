var Population = function (game, size, generation) { 	// IMPORTANT, as of now "generation" only sets the "generationNr" 
	this.numMovers = size;								// we have not yet implementet a way to skip through generations
	this.generationNr = generation; 
	this.groupMover = game.add.group();
	this.groupMover.enableBody = true;
	this.alivePopulationSize = size;
	this.groupMover.physicsBodyType = Phaser.Physics.ARCADE;
	this.game = game; // keep a reference to the game
	this.elitsm = 0.04; // 4 percent of the population size will move straight to the next generation!

	// one timer on the whole population?
	this.timer = 0;

};

Population.prototype.initPopulation = function() {
	this.groupMover.addMultiple(
		Array.from(new Array(this.numMovers), () => new Mover(
			this.game,
			new DNA(),
			800*Math.random(),	// TODO, change 800 to a variable instead, is the witdh of the canvas (or how long the mover should move)
			600*Math.random()	// TODO, change 800 to a variable instead, is the heigth of the canvas
		))
	);
	this.sortPopulation();

	// start the timer
	this.game.time.events.loop(Phaser.Timer.QUARTER, function(){
		// add more to the timer
		this.timer++;
	}, this);
};

// This function will move everything depending on the obstacles/target to sense
Population.prototype.update = function(obstacles, targets, dt) {
	this.groupMover.forEachAlive( (mover)=>{
		// gets an array of values (1/0) which indicates how that sensor has sensed the environment.
		// 1 = obstacle, 0 = no obstacle
		var brainInput = mover.senseEnvironment(obstacles, targets);
		mover.move(dt, brainInput);
	});
};

Population.prototype.nextPopulation = function() {
	var matingPool = []; // holdes all the DNA of the indivuals to mate

	// Elitism, This is the number of individuals that will go straight to the next generation
	var elitismNumber = Math.ceil(this.numMovers*this.elitism); 

	var sumFitness = 0;
	// sum up the fitness from every individ
	this.groupMover.forEach(function(individual){
		sumFitness += individual.DNA.fitness;
	});

	console.log("NEXT POP, totalt fitness: " + sumFitness + " -------------------------");

	// get percent value.. the roulette wheel selection uses this
	this.groupMover.forEach(function(individual){
		var numberOfIndividuals = Math.ceil(individual.DNA.fitness/sumFitness * 10);

		for (var j=0; j<numberOfIndividuals; j++) {		// add the memeber n times according to fitness score
			matingPool.push(individual.DNA);
		}
	});

	// select from matingpool and fill upp the populations size
	// maybe use elitism later and take the best from currentPop to the next pop
	for (var i=elitismNumber; i<this.groupMover.length; i++) {
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
		this.groupMover.children[i].DNA = billybob;
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
	console.log("YOU FOUND A TARGET! WOW");
	target.kill(); // hmmm. eller ska man flytta på den bara till en ny plats kanske?
	// set + på movern, eftersom den får något extra då i fitness kanske?
};

Population.prototype.sortPopulation = function() {
	this.groupMover.children.sort(function(a,b){
		return b.DNA.fitness - a.DNA.fitness;
	});
};

Population.prototype.revivePopulation = function() {
	this.generationNr++;

	// sort the population according to the fitness value, to use elitism

	this.sortPopulation();
	this.nextPopulation();
	this.timer = 0;	// reset the timer
	this.alivePopulationSize = this.numMovers; // make the population large again
	
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

