/*
	see tutorial http://codetowin.io/tutorials/nback-game-states-and-menus/
*/

// Self invoking function for not polluting global scope
(function () {
	var WIDTH = 800;
	var HEIGHT =  600;
	var dt = 1/60;
	var population; 
	var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, '', 
		{ preload: preload, create: create, update: update});

	function preload() {
		// load assets into the game
		game.load.image('diamond', 'assets/diamond.png');
		game.load.image('empty', 'assets/empty.png');
		game.load.image('mover', 'assets/up.png');
	};

	function create() {
		// Define amount of objects in game
		this.numTargets =0;
		this.numObstacles = 10;

		// add groups to handle collision between these different objects in the environment
		// works like an array in many ways
		this.groupTarget = game.add.group();
		this.obstacles = game.add.group();
		population = new Population(game, 200, 1);

		// enables physics on the group
		// ARCADE physics allows AABB collision detection only
		this.groupTarget.enableBody = true;
		this.groupTarget.physicsBodyType = Phaser.Physics.ARCADE;
		this.obstacles.enableBody = true;
		this.obstacles.physicsBodyType = Phaser.Physics.ARCADE;

		//Add an array of movers to the group
		population.initPopulation(game);

		//Add an array of targets to the group
		this.groupTarget.addMultiple(
			//create array with targets (ES6 way)
			Array.from(new Array(this.numTargets), () => new Target(
				game,
				WIDTH*Math.random(),
				HEIGHT*Math.random()
			))
		);

		// As of now obstacles does not need Phasers collision detection => use normal array (no group)
		// they do? if want to look at collision easy between an obstacle and a mover?? 
		// just change in main to the ObstacleSprite.js for group, or Obstacle.js for array.
		// need to remove the addMutiple if only an arrray..
		this.obstacles.addMultiple(Array.from(new Array(this.numObstacles), () => new Obstacle(
				game,
				WIDTH*Math.random(),
				HEIGHT*Math.random()
			))
		);

		// the background of everything
		game.stage.backgroundColor = '#D8D8D8';
	};


	function update(){
		// update positions
		population.groupMover.forEachAlive((mover) => {
			// gets an array of values (1/0) which indicates how that sensor has sensed the environment.
		 	// 1 = obstacle, 0 = no obstacle
		 	var brainInput = mover.senseEnvironment(this.obstacles, this.groupTarget);
		 	mover.move(dt, brainInput); // Use brainInput as argument to move
		});
		this.groupTarget.forEachAlive((target) => target.move(dt));
		this.obstacles.forEach((obstacle) => obstacle.move(dt));

		// collision between a mover and a obstacel. needed to use a sprite based obstacles instead.. 
		game.physics.arcade.overlap(this.obstacles, population.groupMover, population.moverCollided, null, population);

		// checkBoundary(this.groupMover); // if we want it to die at the boundary?
		population.checkBoundary(game, population.groupMover);

		// check if existing movers? alive
		if (population.alivePopulationSize < 1) {
			population.revivePopulation();
		}
	};	
}());