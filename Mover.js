var Mover = function (game, theDNA, x, y) {

	// Inherit from sprite (call its constructor)
	Phaser.Sprite.call(this, game, x, y, 'mover');


	//this.points = 0;

	// DNA is where the neural networks weights are
	this.DNA = theDNA;

	this.brain = new Perceptron(theDNA.genes, 0.001); // the learning constant is the 0.01 n är hur många..
	this.pos = new Victor(x, y);
	this.speed = 50;
	this.vel = new Victor(this.speed, 0);
	this.sensorLength = 180; //80
	this.numberOfSensors = NRSENSORS;// 5;

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

	// arbitrary values (not used at the momemt)
	//this.maxForce = theDNA.maxForce || 0.4;
	//this.maxSpeed = theDNA.maxSpeed || 3.0;

	//lines for sensing - for debugging
	this.lines = Array.from({length: this.numberOfSensors}, () => new Phaser.Line(0, 0, 0, 0));

	// TESTING WITH TIMER!!
	//game.time.events.loop(Phaser.Timer.SECOND, this.updateCounter, this);
	//this.timer = 0; // how long it survived?

	//this.avoidedFitness = 0;
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

Mover.prototype.setFitness = function(timer) {
	var fit = (timer + 1)*3; // this.avoidedFitness

//	console.log("Fitness value " + fit);	

	this.DNA.setFitness(fit); // set fitness smallest to 1
	//console.log("Fitness value: " + fit);
}

Mover.prototype.died = function() {
	//console.log("survived " + this.timer);
	// gör inget här?! kanske göra något sen... 
	// remove the lines!!! vet inte hur??
	//console.log("Died.. made it : " + this.timer +  " s.");
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
	// Euler step


	// quick fix to bounce away from the wall
	/*if( this.pos.x > this.game.world.width ||
			this.pos.x < 0 ){
			this.vel.x *= -1;
			this.bounceWall++;
		} else if (this.pos.y > this.game.world.height ||
			this.pos.y < 0){
			this.vel.y *= -1;
			this.bounceWall++;
		}
	*/

	this.pos = this.pos.add(this.vel.clone().multiplyScalar(dt));
	


	// reposition sprite
	this.x = this.pos.x
	this.y = this.pos.y
	this.angle = this.getRotation();

	// if going towards the end.. bounce at the walls?
};

Mover.prototype.senseEnvironment = function(obstacles, targets) {
	var point;
	var result = Array(this.numberOfSensors).fill(0);
	// take looking direction
	var direction = this.vel.clone()
	direction.normalize().multiplyScalar(this.sensorLength);

	// rotate it to the left
	direction.rotate((Math.PI / 2) + Math.PI / (NRSENSORS-1));

	// for each line, sample from its surroundings to find if it intersects any obstacles.
	this.lines.forEach( (line, i) => {
		// for each line rotate it a bit to the right
		direction.rotate(-Math.PI / (NRSENSORS-1));
		// take the endpoint
		point = direction.clone().add(this.pos);
		// check if any obstacles has this point inside
		obstacles.forEach((obstacle) => {

			var sensedInfo = intersectLineCircle(
				this.pos, // start of sensor ray
				direction, // direction of sensor line (does not need to be normalizes)
				this.sensorLength, // length of sensor line
				obstacle.position, //position of obsacle
				obstacle.radius //radius of obstacle
			);
			result[i] = (sensedInfo > result[i]) ? sensedInfo : result[i];
			// checking borders
			var overlap;
			if (point.x > this.game.world.width){
				var wallPoint = new Victor(this.game.world.width, 0);
				var wallN = new Victor(0, 1);
				var lengthToIntersect = intersectLineLine(wallPoint, wallN, this.pos, direction)
				sensedInfo = 1 - lengthToIntersect / this.sensorLength;
				result[i] = (sensedInfo > result[i]) ? sensedInfo : result[i];
			} else if (point.x < 0){
				var wallPoint = new Victor(0, 0);
				var wallN = new Victor(0, 1);
				var lengthToIntersect = intersectLineLine(wallPoint, wallN, this.pos, direction)
				sensedInfo = 1 - lengthToIntersect / this.sensorLength;
				result[i] = (sensedInfo > result[i]) ? sensedInfo : result[i];
			} else if ( point.y > this.game.world.height){
				var wallPoint = new Victor(0, this.game.world.height);
				var wallN = new Victor(1, 0);
				var lengthToIntersect = intersectLineLine(wallPoint, wallN, this.pos, direction)
				sensedInfo = 1 - lengthToIntersect / this.sensorLength;
				result[i] = (sensedInfo > result[i]) ? sensedInfo : result[i];
			} else if (point.y < 0){
				var wallPoint = new Victor(0, 0);
				var wallN = new Victor(1, 0);
				var lengthToIntersect = intersectLineLine(wallPoint, wallN, this.pos, direction)
				sensedInfo = 1 - lengthToIntersect / this.sensorLength;
				result[i] = (sensedInfo > result[i]) ? sensedInfo : result[i];
			}


			// testing, om nuddat en mover så bättre :P
			//this.avoidedFitness = (result[i]==1) ? this.avoidedFitness+1 : this.avoidedFitness;
		});
		// draw debug lines DO NOT REMOVE
/*		if(result[i]){
			// if line has intersected, shorten the line appropriatly
			direction.normalize().multiplyScalar(this.sensorLength);
			point = direction
				.clone()
				.norm()
				.multiplyScalar(this.sensorLength * (1-result[i]))
				.add(this.pos);
		}
		line.setTo(this.pos.x, this.pos.y, point.x, point.y);
		this.game.debug.geom(line); // to show the lines or not for debbuging sort of.*/
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