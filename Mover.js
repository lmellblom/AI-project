var Mover = function (theDNA, x, y) {

	// Inherit from sprite
	Phaser.Sprite.call(this, GAME.game, x, y, 'mover');

	this.points = 0;
	this.alive = true;
	this.DNA = theDNA;

	this.brain = new Perceptron(theDNA.genes, 0.001); // the learning constant is the 0.01 n är hur många..

	this.pos = new Victor(x, y);
	this.vel = new Victor(3.0, 0.0);
	//this.a = new Victor(0.0, 0.0);
	this.r = 3.0;

	this.angle = this.getRotation();
	this.anchor.x = 0.5;
	this.anchor.y = 0.4;

	this.scale.setTo(0.6);
	// arbitrary values
	this.maxForce = theDNA.maxForce || 0.4;
	this.maxSpeed = theDNA.maxSpeed || 3.0;

	//lines for sensing - for debugging
	/*this.graphics = GAME.game.add.graphics();
	this.graphics.lineStyle(1, 0x0000FF, 0.5);*/
	this.lines = Array.from({length: 5}, () => new Phaser.Line(0, 0, 0, 0));
};

// get sprites methods and extend
Mover.prototype = Object.create(Phaser.Sprite.prototype);
Mover.prototype.constructor = Mover;

Mover.prototype.update = function() {
	//this.steer();
	//this.graphics.clear();
	//this.senseEnvironment();
	this.move();
	this.angle = this.getRotation();
};

Mover.prototype.move = function() {
	//this.vel.add(this.a);
	//limitMagnitude(this.vel, this.maxSpeed);
	//this.pos.add(this.vel);
	///is.a.multiplyScalar(0.0);
	// Euler step
	this.pos = this.pos.add(this.vel.clone().multiplyScalar(dt));
	this.x = this.pos.x
	this.y = this.pos.y
};
Mover.prototype.senseEnvironment = function(obstacles, targets) {
	var point;
	// take looking direction
	var direction = this.vel.clone()
	direction.normalize().multiplyScalar(50);

	direction.rotate(6*(Math.PI / 8));
	this.lines.forEach( line => {
		direction.rotate(-Math.PI / 4);
		point = direction.clone().add(this.pos);
		obstacles.forEach((obstacle) => {
			if(obstacle.circle.contains(point.x, point.y)){
 				console.log('inside åhå');
			}
		});
		line.setTo(this.pos.x, this.pos.y, point.x, point.y);
		GAME.game.debug.geom(line);
	})
	// return array with results
	return this.lines;
};

Mover.prototype.drawLine = function (){

};

Mover.prototype.applyForce = function(force) {
	this.a.add(force);
};

Mover.prototype.seek = function(t) {
	var target = t.clone();
	target.subtract(this.pos);
	target.normalize();
	target.multiplyScalar(this.maxSpeed);
	var steer = target.clone();
	steer.subtract(this.vel);
	limitMagnitude(steer, this.maxForce);
	//this.applyForce(steer);
	return steer;
};


	// a seek function that takes in a array instead of target vectors
Mover.prototype.steer = function(targets) {
/*	var forces = [];
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
	this.brain.train(forces,error);*/
};

Mover.prototype.getRotation = function() {
	return ((this.vel.direction() + Math.PI/2)*180 )/Math.PI ;
};
Mover.prototype.getPosition = function() {
	return this.pos;
}