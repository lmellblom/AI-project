/*
	see tutorial http://codetowin.io/tutorials/nback-game-states-and-menus/
*/

// Self invoking function for not polluting global scope
(function () {
	var WIDTH = 800;
	var HEIGHT =  600;
	var dt = 1/60;

	var skipToGen = 10; // Skips to this generation at start
	var simulationSpeed = 20; // How fast the simulation should be
	var population;
	var allObstacles;
	var allTargets;
	var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, '',
		{ preload: preload, create: create, update: update});


	var frameSpeedElement = document.getElementById("frameSpeed");
	frameSpeedElement.value = simulationSpeed;
	frameSpeedElement.addEventListener("change", (e) => {
		simulationSpeed = e.target.value;
	});
	// default values for the simulation..
	var renderKey;
	var renderObj = false;
	var reachedSkipGeneration = false;

	var renderElement = document.getElementById("toogleRender");
	renderElement.addEventListener("change", (e) => {
		setRender(e.target.checked);
	});

	var skipToGenElement = document.getElementById("skipToGeneration");
	skipToGenElement.value = skipToGen;
	skipToGenElement.addEventListener("change", (e) => {
		skipToGen = e.target.value;

		if(skipToGen > population.generationNr ) {
			renderObj = false;
			setRender(renderObj);
			frameSpeedElement.value = (frameSpeedElement.min + frameSpeedElement.max) / 2;
			simulationSpeed = frameSpeedElement.value;
			document.getElementById("toogleRender").checked = renderObj;
		}
	});
	/* == POPULATION CONFIGS == */

	var perceptronConfig = {
		'type': 'perceptron',
		'numInputs': 16,
		'numOutputs': 2
	}
	var MLPConfig = {
		'type': 'MLP',
		'numInputs': 16,
		'numHidden': 10,
		'numOutputs': 2
	}
	var recurrentConfig = {
		'type': 'recurrent',
		'numInputs': 16,
		'numHidden': 8,
		'numOutputs': 2
	}

	function preload() {
		// load assets into the game
		game.load.image('diamond', 'assets/diamond.png');
		game.load.image('empty', 'assets/wolf.png');
		game.load.image('mover', 'assets/sheep.png');
	};

	function create() {
		// Define amount of objects in game
		this.numTargets = 20;
		this.numObstacles = 10;

		// add the obstacles, targets and the population
		allObstacles = new Groups(game, this.numObstacles, Obstacle);
		allTargets = new Groups(game, this.numTargets, Target);

		population = new Population(game, 80);

		// init pop, obstacles and targets with elements
		population.initPopulation(recurrentConfig);
		allObstacles.initObjects();
		allTargets.initObjects();

		allObstacles.reposition();


		// the background of everything
		game.stage.backgroundColor = '#D8D8D8';
		game.stage.disableVisibilityChange = true;

		renderKey = this.game.input.keyboard.addKey(Phaser.Keyboard.R);
		renderKey.onDown.add(toogleRender, this);

		setRender(renderObj);

	};

// will update the sceen, simulates everything
	function simulates() {
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
			allObstacles.reposition();

			if(population.generationNr == skipToGen) {
				renderObj = true;
				simulationSpeed = 1;
				setRender(renderObj);
				frameSpeedElement.value = simulationSpeed;
				document.getElementById("toogleRender").checked = renderObj;
			}
		}
	}

	// to be able to render the
	function toogleRender() {
		renderObj = !renderObj;
		setRender(renderObj);
		document.getElementById("toogleRender").checked = renderObj;
	}


	// Called every 60 milliseconds
	function update(){

		for(var i = 0; i < simulationSpeed; i++) {
			simulates();
		}

	};

	function setRender(bool){
		// Objects are rendered on screen
		population.getGroup().forEach( (object)=> {
			object.renderable = bool;
		});

		allTargets.getGroup().forEach( (object)=> {
			object.renderable = bool;
		});

		allObstacles.getGroup().forEach( (object)=> {
			object.renderable = bool;
		});
	}
}());