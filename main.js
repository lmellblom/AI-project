/*
	see tutorial http://codetowin.io/tutorials/nback-game-states-and-menus/
*/
var DRAWLINES = false;
var WIDTH = 800;
var HEIGHT = 600;
// Self invoking function for not polluting global scope
(function () {
	var dt = 1/60;
	var wallPadding = 15

	var skipToGen = 2; // Skips to this generation at start
	var simulationSpeed = 20; // How fast the simulation should be
	var population;
	var allObstacles;
	var allTargets;
	var stage;
	var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, 'canvasContainer',

		{ preload: preload, create: create, update: update});

	/* == GUI STUFF == */
	var frameSpeedElement = document.getElementById("frameSpeed");
	frameSpeedElement.value = simulationSpeed;
	document.getElementById("frameSpeedValue").innerHTML = simulationSpeed;
	frameSpeedElement.addEventListener("change", (e) => {
		simulationSpeed = e.target.value;
		document.getElementById("frameSpeedValue").innerHTML = simulationSpeed;
	});
	// default values for the simulation..
	var renderKey;
	var renderObj = false;
	var reachedSkipGeneration = false;

	var renderElement = document.getElementById("toogleRender");
	renderElement.addEventListener("change", (e) => {
		setRender(e.target.checked);
	});

	var renderLinesElement = document.getElementById("toogleLines");
	renderLinesElement.addEventListener("change", (e) => {
		renderLines(e.target.checked);
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
			document.getElementById("frameSpeedValue").innerHTML = simulationSpeed;
			document.getElementById("toogleRender").checked = renderObj;
		}
	});
	/* == POPULATION CONFIGS == */

	var perceptronConfig = {
		'type': 'perceptron',
		'numInputs': 12,
		'numOutputs': 2
	}
	var MLPConfig = {
		'type': 'MLP',
		'numInputs': 12,
		'numHidden': 10,
		'numOutputs': 2
	}
	var recurrentConfig = {
		'type': 'recurrent',
		'numInputs': 12,
		'numHidden': 8,
		'numOutputs': 2
	}

	function preload() {
		// scale the screen
		game.scale.setScreenSize=true;
		game.scale.pageAlignVertically = true;
    	game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    	game.scale.updateLayout(true);


    	// load assets into the game
		game.load.image('diamond', 'assets/star.png');
		game.load.image('obstacle', 'assets/shark.png');
		game.load.image('mover', 'assets/fish.png');
		game.load.image('background', 'assets/water2.png');

		game.load.atlasXML('octopus', 'assets/octopus.png', 'assets/octopus.xml');
	};

	function create() {
		// add a background to the game
		//game.add.sprite(0,20, 'background');
		// Define amount of objects in game
		this.numTargets = 20;
		this.numObstacles = 11;
		// add the obstacles, targets and the population
		allObstacles = new Groups(game, this.numObstacles, Obstacle);
		allTargets = new Groups(game, this.numTargets, Target);

		population = new Population(game, 80);

		// init pop, obstacles and targets with elements
		population.initPopulation(MLPConfig);
		allObstacles.initObjects();
		allTargets.initObjects();

		allObstacles.reposition();

						/* == STAGE == */
		stage = [
			new Wall(game, wallPadding, wallPadding, wallPadding, game.world.height - wallPadding),
			new Wall(game, wallPadding, wallPadding, game.world.width - wallPadding, wallPadding),
			new Wall(game, game.world.width - wallPadding, game.world.height - wallPadding, game.world.width - wallPadding, wallPadding),
			new Wall(game, game.world.width - wallPadding, game.world.height - wallPadding, wallPadding, game.world.height - wallPadding)
		];

		//stage.forEach((wall) => wall.draw());

		// the background of everything
		game.stage.backgroundColor = '#8BD5E6';
		game.stage.disableVisibilityChange = true;

		renderKey = this.game.input.keyboard.addKey(Phaser.Keyboard.R);
		renderKey.onDown.add(toogleRender, this);

		setRender(renderObj);

		renderLines(false);
	};

// will update the sceen, simulates everything
	function simulates() {
		population.update(allObstacles.getGroup(), allTargets.getGroup(), stage, dt);
		allObstacles.update(dt);
		allTargets.update(dt);

		population.checkCollision(allTargets.getGroup(), allObstacles.getGroup());

		// collision between the obstacle and the population, the population should die if this happens
		//game.physics.arcade.overlap(allObstacles.getGroup(), population.getGroup(), population.moverCollided, null, population);
		// collision between a target and the population, then the mover in that pop should get a reward
		//game.physics.arcade.overlap(allTargets.getGroup(), population.getGroup(), population.foundTarget, null, population);

		// check if the population is out of the field
		population.checkBoundary(stage);

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
				document.getElementById("frameSpeedValue").innerHTML = simulationSpeed;
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

	function renderLines(bool) {
		// for each line
		population.getGroup().forEach( (object)=> {
			object.lines.renderable = bool;

		});
	}

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