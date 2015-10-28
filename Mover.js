var Mover = function (game, theDNA, brain, numInputs, x, y) {

	// now the mover will spawn outside everything first, just quick fix
	x = game.world.centerX;
	y = game.world.centerY;

	// Inherit from sprite (call its constructor)
	Phaser.Sprite.call(this, game, x, y, 'octopus');
	//  Create an animation called 'swim',
	//  the fact we don't specify any frames means it will use all frames in the atlas
	this.animations.add('swim');
	//  Play the animation at 30fps on a loop
	this.animations.play('swim', 30, true);

	// DNA is where the neural networks weights are
	this.DNA = theDNA;
	this.brain = brain; // the learning constant is the 0.01 n är hur många..
	this.pos = new Victor(x, y);
	this.speed = 120;
	this.vel = new Victor(this.speed, 0);

	this.surviveTime = 60 * 17; // should survive 15 seconds wihtout food for example
	this.energy = this.surviveTime; // set the start energy to the survive time

	this.sensorLength = 180;
	this.numSensors = numInputs/2;

	// scale the sprite down a bit
	this.scale.setTo(0.2);

	this.r = Math.max(this.height,this.width)/2.0; // the sprite itself has a width and a height
														// use this in order to determine the radius
	// rotate the sprite correctly
	this.angle = this.getRotation();

	//add some offset to the sprite to position is in the center of this.pos
	this.anchor.x = 0.5;
	this.anchor.y = 0.4;

	this.graphics = this.game.add.graphics(0,0);
	//lines for sensing - for debugging
	this.lines = [];
	for(var i=0; i< this.numSensors; i++){
		this.lines.push(new Phaser.Line(0, 0, 0, 0))
	}

	this.inputEnabled = true;
	this.events.onInputDown.add(this.moverClicked, this);
};

// get sprites methods and extend with more methods
Mover.prototype = Object.create(Phaser.Sprite.prototype);
Mover.prototype.constructor = Mover;

// if a mover is clicked on, this function will be called and print out the brain
Mover.prototype.moverClicked = function() {

	var out = {
		"DNA" : this.DNA,
		"brain" : this.brain
	};

	var theMover =  JSON.stringify(out);

	//infoDNA
	document.getElementById("infoDNA").value = theMover;
}

Mover.prototype.updateCounter = function() {
	this.timer++;
}

Mover.prototype.setPositionInMiddle = function() {
	this.pos.x = this.game.world.centerX;//this.game.width*Math.random();
	this.pos.y = this.game.world.centerY;//this.game.height*Math.random();
}

Mover.prototype.setRandomPosition = function() {
	this.pos.x = getRandomInt(40, WIDTH-40); //this.game.width*Math.random();
	this.pos.y = getRandomInt(40, HEIGHT-40);//this.game.height*Math.random();
}
Mover.prototype.updateBrain = function() {
	// the dna should already been set on the mover. just call the brain function
	this.brain.updateWeights(this.DNA.genes);
};

Mover.prototype.setFitness = function(timer) {
	this.DNA.setFitness(timer); 	// set the fitness value how long they survived. 
	this.energy = this.surviveTime; // reset the survive time
}

Mover.prototype.die = function() {
	this.graphics.clear();
	this.isAlive = false;
	this.kill();
}

Mover.prototype.move = function(dt, brainInput) {

	var action = this.brain.feedforward(brainInput);

	if (action[0]>0){
		if(action[1]>0) {
			this.vel.rotate(Math.PI / 30).norm().multiplyScalar(this.speed);
		}
		else {
			this.vel.rotate(-Math.PI / 30).norm().multiplyScalar(this.speed);
		}
		// Euler step
		this.pos = this.pos.add(this.vel.clone().multiplyScalar(dt));
	}

	//tint sprite when 10 seconds remaining of the energy
	if(this.energy < 60*10){
		this.tint = Phaser.Color.interpolateColor(0xffffff, 0x66AA66, 600, 600-this.energy);
	} else {
		this.tint = 16777215;
	}
	// reposition sprite
	this.x = this.pos.x;
	this.y = this.pos.y;
	this.angle = this.getRotation();
};

Mover.prototype.senseEnvironment = function(obstacles, targets, stage) {
	var point;
	//create result array filled with 0
	var result = Array.apply(null, {length: this.numSensors * 2})
		.map(function() {return 0;});
	this.graphics.clear();
	// take looking direction
	var direction = this.vel.clone()
	direction.normalize().multiplyScalar(this.sensorLength);

	// rotate it to the left
	var directionSpan = - (5 * Math.PI/3) / this.numSensors;
	direction.rotate(2 * Math.PI / 3);

	// for each line, sample from its surroundings to find if it intersects any obstacles.
	this.lines.forEach( function (line, i) {
		// for each line rotate it a bit to the right
		rotation = directionSpan * getRandom(0.2,0.8);
		direction.rotate(rotation);
		// take the endpoint
		point = direction.clone().add(this.pos);
		// check if any obstacles has this point inside
		obstacles.forEach(function (obstacle) {

			var sensedInfo = intersectLineCircle(
				this.pos, // start of sensor ray
				direction, // direction of sensor line (does not need to be normalizes)
				this.sensorLength, // length of sensor line
				obstacle.position, //position of obsacle
				obstacle.radius //radius of obstacle
			);
			result[i] = (sensedInfo > result[i]) ? sensedInfo : result[i];
		}, this);

		targets.forEach(function (target) {

			var sensedInfo = intersectLineCircle(
				this.pos, // start of sensor ray
				direction, // direction of sensor line (does not need to be normalizes)
				this.sensorLength, // length of sensor line
				target.position, //position of target
				target.radius //radius of target
			);
			result[this.numSensors + i] = (sensedInfo > result[this.numSensors + i]) ?
				sensedInfo : result[this.numSensors + i];
		}, this);

		// checking borders
		stage.forEach(function (wall) {
			var sensedInfo = intersectLineLine(wall.wallPoint, wall.wallVector, this.pos, direction);
			result[i] = (sensedInfo > result[i]) ? sensedInfo : result[i];
		}, this);

		// draw debug lines
		if(result[i] && line.renderable){
			// if line has intersected, shorten the line appropriatly
			direction.normalize().multiplyScalar(this.sensorLength);
			point = direction
				.clone()
				.norm()
				.multiplyScalar(this.sensorLength * (1-result[i]))
				.add(this.pos);

			//0 inget, 1 masssor
			line.setTo(this.pos.x, this.pos.y, point.x, point.y);
			this.drawLine(line, 0xFF2965);
		}
		if(result[this.numSensors+i] && line.renderable){
			// if line has intersected, shorten the line appropriatly
			direction.normalize().multiplyScalar(this.sensorLength);
			point = direction
				.clone()
				.norm()
				.multiplyScalar(this.sensorLength * (1-result[i+this.numSensors]))
				.add(this.pos);

			line.setTo(this.pos.x, this.pos.y, point.x, point.y);
			this.drawLine(line, 0x5AFB00);
		}
		direction.rotate(-rotation).rotate(directionSpan);
	}, this)
	// return array with results
	return result;
};

Mover.prototype.getRotation = function() {
	return ((this.vel.direction() + Math.PI/2)*180 )/Math.PI ;
};

Mover.prototype.drawLine = function(line, color) {
	this.graphics.beginFill();
	this.graphics.lineStyle(1, color, 1);
	this.graphics.moveTo(line.start.x, line.start.y);
	this.graphics.lineTo(line.end.x, line.end.y);
	this.graphics.endFill();
};
