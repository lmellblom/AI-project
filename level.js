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
		this.targets = [];
		this.movers = [];
		this.nrOfTargets = 3;
		this.populationSize = 2;

		// add new movers
		for (var i=0; i<this.populationSize; i++) {
			this.movers[i] = new Mover(new DNA(2), getRandom(0+40, gameWidth-40), getRandom(0+40, gameHeight-40), getRandom(0, 3.0) , getRandom(0,0.4));
		}
		// add new targets. the randomTarget - function is defined in helpFunctions and returna an Victory object with a random x and y value.
		for (var i = 0; i<this.nrOfTargets; i++) {
			this.targets[i] = randomTarget(gameWidth, gameHeight);
		}

		// the background of everything
		this.game.stage.backgroundColor = '#D8D8D8';

		// add groups to handle collision between these different objects in the environment
		this.groupMover = this.add.group();
		this.groupTarget = this.add.group();

		// enables physics on the group
		this.groupTarget.enableBody = true;
    	this.groupTarget.physicsBodyType = Phaser.Physics.ARCADE;
    	this.groupMover.enableBody = true;
    	this.groupMover.physicsBodyType = Phaser.Physics.ARCADE;

		// place out the mover
		this.movers.forEach(function(mover){
			// get the location and the angle from the mover object
			var loc = mover.getLocation();
			var sprite = this.add.sprite(loc.x, loc.y, 'mover');

			sprite.angle = mover.getRotation();
			sprite.scale.setTo(0.6);
			sprite.moverObject = mover; 	// a reference(?) to the mover object in the sprite, to access when it collide.

			this.groupMover.add(sprite);
		}, this);

		// place the targets
		this.targets.forEach(function(target){
			var sprite = this.add.sprite(target.x, target.y, 'diamond');
			sprite.scale.setTo(0.7);

			sprite.anchor.set(0.5);
			sprite.targetObject = target;
			sprite.isActive = true;	// to be able to know if the target is taken or not. 

			this.groupTarget.add(sprite);
		}, this);
	},

	update: function(){
		// update the movers position in the environment
		this.updateAllMovers();
		this.moveTargets();

		// checks for collision/overlap between these two groups and calls the collisionHandler-function
		this.game.physics.arcade.overlap(this.groupTarget, this.groupMover, this.collisionHandler, null, this);
	},
	collisionHandler : function(target, mover) {
		target.kill();				// kills the sprite
		target.isActive = false;	// set this to be inactive
	},
	moveTargets : function() {
		this.groupTarget.forEach(function(target){
			target.x = target.x+0.5;
			target.targetObject.x = target.x;
		}, this);
	},

	updateAllMovers : function() {
		// pick out every target that is active in the environment. here we should instead
		// maybe use direction from the mover to know the target?? just for now
		var allTargets = [];
		this.groupTarget.forEach(function(target) {
			if (target.isActive)
				allTargets.push(target.targetObject);
		}, this);

		// for each mover, call the update and steer function on the object (all these functionality is in the Mover.js)
		this.groupMover.forEach(function(mover) {
			mover.moverObject.steer(allTargets);
			mover.moverObject.update();
			var loc = mover.moverObject.getLocation();
			var rot = mover.moverObject.getRotation();

			// change position of the sprite
			mover.x = loc.x;
			mover.y = loc.y;
			mover.angle = rot;
		}, this);
	}
};