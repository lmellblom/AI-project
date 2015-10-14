var Mover = function (game, theDNA, brain, numInputs, x, y) {

	// Inherit from sprite (call its constructor)
	Phaser.Sprite.call(this, game, x, y, 'mover');


	//this.points = 0;

	// DNA is where the neural networks weights are
	this.DNA = theDNA;

	this.brain = brain; // the learning constant is the 0.01 n är hur många..
	this.pos = new Victor(x, y);
	this.speed = 120;
	this.vel = new Victor(this.speed, 0);

	this.sensorLength = 150;
	this.numSensors = numInputs/2;

	this.targetsCollected = 0;

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
	this.lines = Array.from({length: this.numSensors}, () => new Phaser.Line(0, 0, 0, 0));

	// TESTING WITH TIMER!!
	//game.time.events.loop(Phaser.Timer.SECOND, this.updateCounter, this);
	//this.timer = 0; // how long it survived?

	//this.avoidedFitness = 0;

	this.inputEnabled = true;
	this.events.onInputDown.add(this.moverClicked, this);
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

// if a mover is clicked on, this function will be called and print out the brain
Mover.prototype.moverClicked = function() {
	console.log(this.DNA.genes.toString());
}

Mover.prototype.updateCounter = function() {
	this.timer++;
}

Mover.prototype.setRandomPosition = function() {
	this.pos.x = this.game.world.centerX;//this.game.width*Math.random();
	this.pos.y = this.game.world.centerY;//this.game.height*Math.random();
}
Mover.prototype.updateBrain = function() {
	// the dna should already been set on the mover. just call the brain function
	this.brain.updateWeights(this.DNA.genes);
};

Mover.prototype.setFitness = function(timer) {
	var fit = timer*timer;
	fit += this.targetsCollected*100000;
	fit = (fit < 0) ? 1 : fit;
	this.DNA.setFitness(fit); // set fitness smallest to 1
	this.targetsCollected = 0;
	//this.avoidedFitness=0;
}

Mover.prototype.died = function() {
	//console.log("survived " + this.timer);
	// gör inget här?! kanske göra något sen...	
	// remove the lines!!! vet inte hur??
	//console.log("Died.. made it : " + this.timer +  " s.");
}

Mover.prototype.move = function(dt, brainInput) {

	var action = this.brain.feedforward(brainInput);

	if (action[0]>0){
		//this.speed = 120;
		if(action[1]>0) {
			this.vel.rotate(Math.PI / 50).norm().multiplyScalar(this.speed);
		}
		else {
			this.vel.rotate(-Math.PI / 50).norm().multiplyScalar(this.speed);
		}
		// Euler step
		this.pos = this.pos.add(this.vel.clone().multiplyScalar(dt));
	}
	// if only 1 output
/*	if(action[0]>0){
		this.vel.rotate(Math.PI / 50).norm().multiplyScalar(this.speed);
	} else {
		this.vel.rotate(-Math.PI / 50).norm().multiplyScalar(this.speed);
	}
	this.pos = this.pos.add(this.vel.clone().multiplyScalar(dt));*/
	// reposition sprite
	this.x = this.pos.x;
	this.y = this.pos.y;
	this.angle = this.getRotation();
};

Mover.prototype.senseEnvironment = function(obstacles, targets, stage) {
	var point;
	var result = Array(this.numSensors * 2).fill(0);
	// take looking direction
	var direction = this.vel.clone()
	direction.normalize().multiplyScalar(this.sensorLength);

	// rotate it to the left
	//direction.rotate((Math.PI / 2) + Math.PI / (this.numSensors-1));
	//var directionSpan = -Math.PI/3;
	var directionSpan = - (5 * Math.PI/3)/this.numSensors;

	direction.rotate(2 * Math.PI / 3);

	// for each line, sample from its surroundings to find if it intersects any obstacles.
	this.lines.forEach( (line, i) => {
		// for each line rotate it a bit to the right
		//direction.rotate((-Math.PI / (this.numSensors-1) ) + getRandom(-0.5,0.5) );
		rotation = directionSpan * getRandom(0.2,0.8);
		direction.rotate(rotation);
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
		});

		targets.forEach((target) => {

			var sensedInfo = intersectLineCircle(
				this.pos, // start of sensor ray
				direction, // direction of sensor line (does not need to be normalizes)
				this.sensorLength, // length of sensor line
				target.position, //position of target
				target.radius //radius of target
			);
			result[this.numSensors + i] = (sensedInfo > result[this.numSensors + i]) ?
				sensedInfo : result[this.numSensors + i];
		});

		// checking borders
		var overlap;
		stage.forEach((wall) => {
			var wallPoint = new Victor(wall.x0, wall.y0);
			var wallVector = new Victor(wall.x1 - wall.x0, wall.y1 - wall.y0);
			var lengthToIntersect = intersectLineLine(wallPoint, wallVector, this.pos, direction);
			sensedInfo = 1 - lengthToIntersect / this.sensorLength;
			result[i] = (sensedInfo > result[i]) ? sensedInfo : result[i];
		});
		/*if (point.x > this.game.world.width){
			var wallPoint = new Victor(this.game.world.width, 0);
			var wallN = new Victor(0, 1);
			var lengthToIntersect = intersectLineLine(wallPoint, wallN, this.pos, direction);
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
		}*/
/*		// draw debug lines DO NOT REMOVE
		if(result[i]){
			// if line has intersected, shorten the line appropriatly
			direction.normalize().multiplyScalar(this.sensorLength);
			point = direction
				.clone()
				.norm()
				.multiplyScalar(this.sensorLength * (1-result[i]))
				.add(this.pos);
		}
		line.setTo(this.pos.x, this.pos.y, point.x, point.y);
		var colors = ["#000000", "#FFFFFF", "#007829"];
		this.game.debug.geom(line, colors[i%3]); // to show the lines or not for debbuging sort of.*/

		direction.rotate(-rotation).rotate(directionSpan);
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