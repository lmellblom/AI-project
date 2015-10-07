var Mover = function (game, theDNA, x, y) {

	// Inherit from sprite (call its constructor)
	Phaser.Sprite.call(this, game, x, y, 'mover');

	// DNA is where the neural networks weights are
	this.DNA = theDNA;
	this.brain = new Perceptron(theDNA.genes, 0.001); // the learning constant is the 0.01 n är hur många..
	this.pos = new Victor(x, y);
	this.speed = 50;
	this.vel = new Victor(this.speed, 0);
	this.sensorLength = 110; //80
	this.numberOfSensors = 5; 

	// Leave out acceleration for the time being, dont need to add complexity right now.
	//this.a = new Victor(0.0, 0.0);
	this.r = 3.0;

	// rotate the sprite correctly
	this.angle = this.getRotation();

	//add some offset to the sprite to position is in the center of this.pos
	this.anchor.x = 0.5;
	this.anchor.y = 0.4;

	// scale the sprite down a bit
	this.scale.setTo(0.15);

	//lines for sensing - for debugging
	this.lines = Array.from({length: this.numberOfSensors}, () => new Phaser.Line(0, 0, 0, 0));

	// TESTING WITH TIMER!!
	game.time.events.loop(Phaser.Timer.SECOND, this.updateCounter, this);
	this.timer = 0; // how long it survived?

	//this.avoidedFitness = 0;
};

// get sprites methods and extend with more methods
Mover.prototype = Object.create(Phaser.Sprite.prototype);
Mover.prototype.constructor = Mover;

Mover.prototype.updateCounter = function() {
	this.timer++;
}

Mover.prototype.setRandomPosition = function() {
	this.pos.x = this.game.width*Math.random();
	this.pos.y = this.game.height*Math.random();
}

Mover.prototype.updateBrain = function() {
	// the dna should already been set on the mover. just call the brain function
	this.brain.updateWeights(this.DNA.genes); 
};

Mover.prototype.setFitness = function() {
	//var fit = (this.timer + 1)*3; 				//Linnear 
	var fit = (this.timer + (0.5 * this.timer)); 	//Exponential 

	this.DNA.setFitness(fit); // set fitness smallest to 1
	this.timer = 0; // reset fitness
	//this.avoidedFitness=0;
}

Mover.prototype.move = function(dt, brainInput) {
	//this.vel.add(this.a);
	//limitMagnitude(this.vel, this.maxSpeed);
	//this.pos.add(this.vel);
	///is.a.multiplyScalar(0.0);

	var action = this.brain.feedforward(brainInput);
	switch (action.join(' ')){
		case '1 -1':
			//go left
			this.vel.rotate(Math.PI / 50).norm().multiplyScalar(this.speed);
			break;
		case '-1 1':
			//go right
			this.vel.rotate(-Math.PI / 50).norm().multiplyScalar(this.speed);
			break;
		case '1 1':
			//go forward
			this.vel.norm().multiplyScalar(this.speed*3);
			break;
		default: // 0 - 0
			//stand still (almost)
			this.vel.norm().multiplyScalar(0.1);
	}

	this.pos = this.pos.add(this.vel.clone().multiplyScalar(dt));

	// reposition sprite
	this.x = this.pos.x
	this.y = this.pos.y
	this.angle = this.getRotation();
};

Mover.prototype.senseEnvironment = function(obstacles, targets) {
	var point;
	var result = [];
	// take looking direction
	var direction = this.vel.clone()
	direction.normalize().multiplyScalar(this.sensorLength);

	// rotate it to the left
	direction.rotate(6*(Math.PI / 8));

	// for each line, sample from its surroundings to find if it intersects any obstacles.
	// Right now it does not find the exact intersection point, only if it has intersected or not
	// Could actually be done with just points instead of lines.
	this.lines.forEach( (line, i) => {
		// for each line rotate it a bit to the right
		direction.rotate(-Math.PI / 4);
		// take the endpoint
		point = direction.clone().add(this.pos);
		// check if any obstacles has this point inside
		obstacles.forEach((obstacle) => {
			//result[i] = obstacle.sprite.contains(point.x, point.y) ? 1 : 0;
			result[i] = Phaser.Math.distance(obstacle.x, obstacle.y, point.x, point.y) <= 50 ? 1 : 0; // 48 since pixel width of the circle? maybe a little bit smaller. 
			
			// även kolla kant här kanske? 
			if (point.x > this.game.world.width || point.x < 0 || point.y > this.game.world.height ||
				point.y < 0)
				result[i] = 1;
			
			// testing, om nuddat en mover så bättre :P
			//this.avoidedFitness = (result[i]==1) ? this.avoidedFitness+1 : this.avoidedFitness;
		});
		// draw line
		line.setTo(this.pos.x, this.pos.y, point.x, point.y);
		//this.game.debug.geom(line); // to show the lines or not for debbuging sort of.
	})
	// return array with results
	return result;
};

Mover.prototype.getRotation = function() {
	return ((this.vel.direction() + Math.PI/2)*180 )/Math.PI ;
};
Mover.prototype.getPosition = function() {
	return this.pos;
}