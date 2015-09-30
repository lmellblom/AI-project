var Mover = function (game, theDNA, x, y) {

	// Inherit from sprite (call its constructor)
	Phaser.Sprite.call(this, game, x, y, 'mover');

	//this.points = 0;

	// DNA is where the neural networks weights are
	this.DNA = theDNA;

	this.brain = new Perceptron(theDNA.genes, 0.001); // the learning constant is the 0.01 n är hur många..
	this.pos = new Victor(x, y);
	this.vel = new Victor(3.0, 0.0);
	// Leave out acceleration for the time being, dont need to add complexity right now.
	//this.a = new Victor(0.0, 0.0);
	this.r = 3.0;

	// rotate the sprite correctly
	this.angle = this.getRotation();

	//add some offset to the sprite to position is in the center of this.pos
	this.anchor.x = 0.5;
	this.anchor.y = 0.4;

	// scale the sprite down a bit
	this.scale.setTo(0.6);

	// arbitrary values (not used at the momemt)
	//this.maxForce = theDNA.maxForce || 0.4;
	//this.maxSpeed = theDNA.maxSpeed || 3.0;

	//lines for sensing - for debugging
	this.lines = Array.from({length: 5}, () => new Phaser.Line(0, 0, 0, 0));
};

// get sprites methods and extend with more methods
Mover.prototype = Object.create(Phaser.Sprite.prototype);
Mover.prototype.constructor = Mover;

// called each frame
/*Mover.prototype.update = function() {
	//this.steer();
	//this.graphics.clear();
	//this.senseEnvironment();

};*/

Mover.prototype.move = function(dt) {
	//this.vel.add(this.a);
	//limitMagnitude(this.vel, this.maxSpeed);
	//this.pos.add(this.vel);
	///is.a.multiplyScalar(0.0);

	// TODO: add brainInput as parameter to method.
	// Then send brainInput to brain and get result
	// (result should be two values in an array (1/0))
	// map the result values to actions => eg:
	// 1-0 => go left
	// 0-1 => go right
	// 1-1 => go forward
	// 0-0 => stand still

	// Euler step
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
	direction.normalize().multiplyScalar(50);

	// rotate it to the left
	direction.rotate(6*(Math.PI / 8));

	// for each line, sample from its surroundings to find if it intersects any obstacles.
	// Right now it does not find the exact intersection point, only if it has intersected or not
	// Could actually be done with just points instead of lines.
	this.lines.forEach( line => {
		// for each line rotate it a bit to the right
		direction.rotate(-Math.PI / 4);
		// take the endpoint
		point = direction.clone().add(this.pos);
		// check if any obstacles has this point inside
		obstacles.forEach((obstacle, i) => {
			result[i] = obstacle.circle.contains(point.x, point.y) ? 1 : 0
		});
		// draw line
		line.setTo(this.pos.x, this.pos.y, point.x, point.y);
		this.game.debug.geom(line);
	})
	// return array with results
	return result;
};

// not used at the moment
/*Mover.prototype.applyForce = function(force) {
	this.a.add(force);
};*/

// not used at the moment
/*Mover.prototype.seek = function(t) {
	var target = t.clone();
	target.subtract(this.pos);
	target.normalize();
	target.multiplyScalar(this.maxSpeed);
	var steer = target.clone();
	steer.subtract(this.vel);
	limitMagnitude(steer, this.maxForce);
	//this.applyForce(steer);
	return steer;
};*/


// a seek function that takes in a array instead of target vectors
// not used at the moment
/*Mover.prototype.steer = function(targets) {
	var forces = [];
	for (var i=0; i<targets.length; i++) {
		forces[i] = this.seek(targets[i]);
	}

	//var ouput = brain.process(forces);
	var result = this.brain.feedforward(forces);
	this.applyForce(result);

	// train the network! if we use GA instead this will not be used!!!!
	// this will train the network to be centered in the screen
	var desired = new Victor(gameWidth/2, gameHeight/2);
	var error = desired.clone().subtract(this.pos);
	error.multiplyScalar(this.points);
	this.brain.train(forces,error);
};*/

Mover.prototype.getRotation = function() {
	return ((this.vel.direction() + Math.PI/2)*180 )/Math.PI ;
};
Mover.prototype.getPosition = function() {
	return this.pos;
}