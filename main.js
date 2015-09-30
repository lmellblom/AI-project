/*
	see tutorial http://codetowin.io/tutorials/nback-game-states-and-menus/
*/

// Self invoking function for not polluting global scope
(function () {

	var WIDTH = 800;
	var HEIGHT =  600;
	var dt = 1/60;

	var game = new Phaser.Game(
		WIDTH,
		HEIGHT,
		Phaser.AUTO,
		'',
		{
			preload: preload,
			create: create,
			update: update
		}
	);

	function preload() {
		// load assets into the game
		this.load.image('diamond', 'assets/diamond.png');
		this.load.image('mover', 'assets/up.png');
	};

	function create() {
		// Define amount of objects in game
		this.numTargets = 3;
		this.numObstacles = 3;
		this.numMovers = 2;

		// add groups to handle collision between these different objects in the environment
		// works like an array in many ways
		this.groupMover = this.add.group();
		this.groupTarget = this.add.group();

		//Add an array of movers to the group
		this.groupMover.addMultiple(
			//create array with movers (ES6 way)
			Array.from(new Array(this.numMovers), () => new Mover(
				game,
				new DNA(2),
				WIDTH*Math.random(),
				HEIGHT*Math.random()
			))
		);

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
		this.obstacles = Array.from(new Array(this.numObstacles), () => new Obstacle(
				game,
				WIDTH*Math.random(),
				HEIGHT*Math.random()
			)
		);

		// the background of everything
		this.game.stage.backgroundColor = '#D8D8D8';

		// enables physics on the group
		// ARCADE physics allows AABB collision detection only
		this.groupTarget.enableBody = true;
		this.groupTarget.physicsBodyType = Phaser.Physics.ARCADE;
		this.groupMover.enableBody = true;
		this.groupMover.physicsBodyType = Phaser.Physics.ARCADE;
	};

	function update(){

		// update the objects position in the environment
		this.groupMover.forEachAlive((mover) => {
			// gets an array of values (1/0) which indicates how that sensor has sensed the environment.
			// 1 = obstacle
			// 0 = no obstacle
			var brainInput = mover.senseEnvironment(this.obstacles, this.groupTarget);
			// Use brainInput as argument to move
			mover.move(dt)
		});

		this.groupTarget.forEachAlive((target) => target.move(dt));
		this.obstacles.forEach((obstacle) => obstacle.move(dt));

		// checks for collision/overlap between these two groups and calls the collisionHandler-function
		this.game.physics.arcade.overlap(this.groupTarget, this.groupMover, this.collisionHandler, null, this);
	};

	function collisionHandler(target, mover) {
		target.kill();				// kills the sprite
		target.isActive = false;	// set this to be inactive
	};

}());