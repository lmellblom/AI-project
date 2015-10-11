/*
	see tutorial http://codetowin.io/tutorials/nback-game-states-and-menus/
*/

// global properties, for both the brain and the perceptron
var NRSENSORS = 8;
var NRMIDDLELAYERS = 0;
var NROUTPUTS = 2;
// find a better way for doing this later

// Self invoking function for not polluting global scope
(function () {
	var WIDTH = 800;
	var HEIGHT =  600;
	var dt = 1/60;
	var render = false; // Whether to render objects or not
	var skipToGen = 5; // Skips to this generation at start
	var simulationSpeed = 20; // How fast the simulation should be
	var population;
	var allObstacles; 
	var allTargets;
	var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, '', 
		{ preload: preload, create: create, update: update});


	function preload() {
		// load assets into the game
		game.load.image('diamond', 'assets/diamond.png');
		game.load.image('empty', 'assets/wolf.png');
		game.load.image('mover', 'assets/sheep.png');
	};

	function create() {
		// Define amount of objects in game
		this.numTargets = 0;
		this.numObstacles = 15;

		// add the obstacles, targets and the population
		allObstacles = new Groups(game, this.numObstacles, Obstacle);
		allTargets = new Groups(game, this.numTargets, Target);

		population = new Population(game, 200, 1);

		// init pop, obstacles and targets with elements
		population.initPopulation();
		allObstacles.initObjects();
		allTargets.initObjects();

		// the background of everything
		game.stage.backgroundColor = '#D8D8D8';

	};

	// Function which is used to quickly render a predefined number
	// of generations, which depends on the variable skipToGen
	function skipGeneration() {

		// Objects are not rendered on screen
		population.getGroup().forEach( (object)=> { 
			object.renderable = false;
		});

		allTargets.getGroup().forEach( (object)=> { 
			object.renderable = false;
		});

		allObstacles.getGroup().forEach( (object)=> { 
			object.renderable = false;
		});

		// Faster update of world state
		for(var i = 0; i < simulationSpeed; i++) {

			// update positions of everything in the world
			population.update(allObstacles.getGroup(), allTargets.getGroup(), dt);
			allObstacles.update(dt);
			allTargets.update(dt);

			// collision between the obstacle and the population, the population should die if this happens
			game.physics.arcade.overlap(allObstacles.getGroup(), population.getGroup(), population.moverCollided, null, population);
			// collision between a target and the population, then the mover in that pop should get a reward
			game.physics.arcade.overlap(allTargets.getGroup(), population.getGroup(), population.foundTarget, null, population);

			// check if the population is out of the field
			population.checkBoundary();

			// check if existing movers? if everyone died we should call the next generation
			if (population.alivePopulationSize < 1) {
				population.revivePopulation();
				// revive the target also maybe??
				allTargets.revive();
			}
			
		};
	
		console.log("gencounter is: " + population.generationNr);
		if(population.generationNr == skipToGen) {
			render = true; // Training of network is done

		// Objects are rendered on screen
		population.getGroup().forEach( (object)=> { 
			object.renderable = true;
		});

		allTargets.getGroup().forEach( (object)=> { 
			object.renderable = true;
		});

		allObstacles.getGroup().forEach( (object)=> { 
			object.renderable = true;
		});
		}
		
	};


	function update(){

		// Render normally using Phaser
		if(render == true) {

			// update positions of everything in the world
			population.update(allObstacles.getGroup(), allTargets.getGroup(), dt);
			allObstacles.update(dt);
			allTargets.update(dt);

			// collision between the obstacle and the population, the population should die if this happens
			game.physics.arcade.overlap(allObstacles.getGroup(), population.getGroup(), population.moverCollided, null, population);
			// collision between a target and the population, then the mover in that pop should get a reward
			game.physics.arcade.overlap(allTargets.getGroup(), population.getGroup(), population.foundTarget, null, population);

			// check if the population is out of the field
			population.checkBoundary();

			// check if existing movers? if everyone died we should call the next generation
			if (population.alivePopulationSize < 1) {
				population.revivePopulation();
				// revive the target also maybe??
				allTargets.revive();
			}
		}
		else {
			// Calculate update world state without rendering
			skipGeneration();
		}

	};
}());