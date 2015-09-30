var GAME = GAME || {};

GAME.Level = function() {};

GAME.Level.prototype = {
	preload: function() {
		// load assets into the game
		this.load.image('diamond', 'assets/diamond.png');
		this.load.image('mover', 'assets/up.png');
	},
	create: function() {
		// create the different variables
		this.numTargets = 3;
		this.numObstacles = 3;
		this.numMovers = 2;

		// add groups to handle collision between these different objects in the environment
		this.groupMover = this.add.group();
		this.groupTarget = this.add.group();
		this.groupMover.addMultiple(
			Array.from(new Array(this.numMovers), () => new Mover(
				new DNA(2),
				gameWidth*Math.random(),
				gameHeight*Math.random()
			))
		);
		this.groupTarget.addMultiple(
			Array.from(new Array(this.numTargets), () => new Target(
				gameWidth*Math.random(),
				gameHeight*Math.random()
			))
		);

		this.obstacles = Array.from(new Array(this.numObstacles), () => new Obstacle(
				gameWidth*Math.random(),
				gameHeight*Math.random()
			)
		);
		// the background of everything
		this.game.stage.backgroundColor = '#D8D8D8';

		// enables physics on the group
		this.groupTarget.enableBody = true;
		this.groupTarget.physicsBodyType = Phaser.Physics.ARCADE;
		this.groupMover.enableBody = true;
		this.groupMover.physicsBodyType = Phaser.Physics.ARCADE;
	},

	update: function(){
		// Let Movers sense environment
		this.groupMover.forEachAlive((mover) => {

			var lines = mover.senseEnvironment(this.obstacles, this.groupTarget)

		});

		// update the movers position in the environment
		this.groupMover.forEachAlive((mover) => mover.update());
		this.groupTarget.forEachAlive((target) => target.update());
		this.obstacles.forEach((obstacle) => obstacle.update());

		// checks for collision/overlap between these two groups and calls the collisionHandler-function
		this.game.physics.arcade.overlap(this.groupTarget, this.groupMover, this.collisionHandler, null, this);
	},
	collisionHandler : function(target, mover) {
		target.kill();				// kills the sprite
		target.isActive = false;	// set this to be inactive
	}
};