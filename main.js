var WIDTH = 1200;
var HEIGHT = 800;
// Self invoking function for not polluting global scope
(function () {
	var dt = 1/60;
	var wallPadding = 1;

	var skipToGen = 1; // Skips to this generation at start
	var simulationSpeed = 1; // How fast the simulation should be
	var renderObj = true;
	var reachedSkipGeneration = true;
	var populationSize = 80;
	var population;
	var allObstacles;
	var allTargets;
	var stage;
	var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, 'canvasContainer',
		{ preload: preload, create: create, update: update});

	var maxGenerationTesting = 25;
	var TESTINGMODE = true;

	/* == GUI STUFF == */

	/* Getting the elements */
	var frameSpeedElement = document.getElementById("frameSpeed");
	var frameSpeedTextElement = document.getElementById("frameSpeedValue");
	var renderElement = document.getElementById("toogleRender");
	var renderLinesElement = document.getElementById("toogleLines");
	var skipToGenElement = document.getElementById("skipToGeneration");
	var btnInsertMoverElement = document.getElementById("insertButton");
	var frameSpeedElement = document.getElementById("frameSpeed");
	var insertMoverElement = document.getElementById("insertDNA");
	var numberPopElement = document.getElementById("numberPop");

	/* Setting event listeners */
	frameSpeedElement.addEventListener("change", function(e){
		setFrameSpeed(e.target.value);
	});
	renderElement.addEventListener("change", function(e) {
		setRender(e.target.checked);
	});
	renderLinesElement.addEventListener("change", function(e) {
		setRenderLines(e.target.checked);
	});
	skipToGenElement.addEventListener("change", function(e) {
		skipToGeneration(e.target.value);
	});
	btnInsertMoverElement.addEventListener("click", function(e) {
		var mover = JSON.parse(insertMoverElement.value);
		if(mover !== undefined){
			population.addMover(mover);
			numberPopElement.innerHTML = population.numMovers;
		}
	});
	/* default values*/
	frameSpeedElement.value = simulationSpeed;
	skipToGenElement.value = skipToGen;
	numberPopElement.innerHTML = populationSize;
	renderElement.checked = renderObj;
	frameSpeedTextElement.innerHTML = simulationSpeed;

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
		'numHidden': 10,
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
		game.load.atlasXML('seacreatures', 'assets/seacreatures.png', 'assets/seacreatures.xml');

		game.load.atlasXML('octopus', 'assets/octopus.png', 'assets/octopus.xml');
	};

	function create() {

		// Define amount of objects in game
		this.numTargets = 32;
		this.numObstacles = 16;
		// add the obstacles, targets and the population
		allObstacles = new Groups(game, this.numObstacles, Obstacle);
		allTargets = new Groups(game, this.numTargets, Target);

		population = new Population(game, populationSize);

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

		stage.forEach(function(wall){wall.draw()});

		// the background of everything
		game.stage.backgroundColor = '#8BD5E6';
		game.stage.disableVisibilityChange = true;

		setRender(renderObj);

		setRenderLines(false);
	};

	// will update the sceen, simulates everything
	function simulate() {
		population.update(allObstacles.getGroup(), allTargets.getGroup(), stage, dt);
		allObstacles.update(dt);
		allTargets.update(dt);

		population.checkCollision(allTargets.getGroup(), allObstacles.getGroup());
		// check if the population is out of the field
		population.checkBoundary(stage);

		// check if existing movers? if everyone died we should call the next generation
		if (population.alivePopulationSize < 1) {
			population.revivePopulation();

			if (TESTINGMODE && population.generationNr == maxGenerationTesting+1) {
				console.log("==== Reached testing max generation ==== ");
				console.log("Average fitness : ");
				console.log(population.averageFitness);
				console.log("Best fitness: ");
				console.log(population.bestFitness);
			}

			// revive the target also maybe??
			allTargets.revive();
			allObstacles.reposition();
			if(population.generationNr == skipToGen) {
				renderObj = true;
				simulationSpeed = 1;
				setRender(renderObj);
				frameSpeedElement.value = simulationSpeed;
				renderElement.checked = renderObj;
				frameSpeedTextElement.innerHTML = simulationSpeed;
			}
		}
	}

	// to be able to render the
	function toogleRender() {
		renderObj = !renderObj;
		setRender(renderObj);
		renderElement.checked = renderObj;
	}

	// Called every 60 milliseconds
	function update(){

		for(var i = 0; i < simulationSpeed; i++) {
			simulate();
		}

	};

	function setRenderLines(bool) {
		// for each line
		population.getGroup().forEach( function(object){
			object.lines.forEach(function(line){
				line.renderable = bool;
				line.visible = bool;
			})
		});
	}

	function setRender(bool){
		// Objects are rendered on screen
		population.getGroup().forEach(function(object) {
			object.renderable = bool;
		});
		allTargets.getGroup().forEach(function(object) {
			object.renderable = bool;
		});
		allObstacles.getGroup().forEach(function(object) {
			object.renderable = bool;
		});
	}

	function setFrameSpeed(speed){
		simulationSpeed = speed;
		frameSpeedTextElement.innerHTML = simulationSpeed;
	}

	function skipToGeneration(generation){
		skipToGen = generation;
		if(skipToGen > population.generationNr ) {
			renderObj = false;
			setRender(renderObj);
			frameSpeedElement.value = (frameSpeedElement.min + frameSpeedElement.max) / 2;
			simulationSpeed = frameSpeedElement.value;
			frameSpeedTextElement.innerHTML = simulationSpeed;
			renderElement.checked = renderObj;
		}
	}
}());