var Mover = function (theDNA, x, y, maxSpeed, maxForce) {
	this.points = 0;
	this.alive = true;
	this.DNA = theDNA;

	this.brain = new Perceptron(theDNA.genes, 0.001); // the learning constant is the 0.01 n är hur många..

	this.loc = new Victor(x,y); 
	this.vel = new Victor(0.0,0.0);
	this.a = new Victor(0.0,0.0); 
	this.r = 3.0;

	// arbitrary values
	this.maxForce = maxForce;
	this.maxSpeed = maxSpeed;

	this.update = function() {
		this.vel.add(this.a);
		limitMagnitude(this.vel, this.maxSpeed);
		this.loc.add(this.vel);
		this.a.multiplyScalar(0.0);
	}

	this.applyForce = function(force) {
		this.a.add(force);
	}

	this.seek = function(t) {
		var target = t;
		var desired = target.clone();
		desired.subtract(this.loc);
		desired.normalize();
		desired.multiplyScalar(this.maxSpeed);
		var steer = desired.clone();
		steer.subtract(this.vel);
		limitMagnitude(steer, this.maxForce);
		//this.applyForce(steer);
		return steer;
	}


	// a seek function that takes in a array instead of target vectors
	this.steer = function(targets) {
		var forces = [];
		for (var i=0; i<targets.length; i++) {
			forces[i] = this.seek(targets[i]);
		}

		//var ouput = brain.process(forces);
		var result = this.brain.feedforward(forces);
		this.applyForce(result);

		// train the network! if we use GA instead this will not be used!!!! this will train the network to be centered in the screen
		var desired = new Victor(gameWidth/2, gameHeight/2);
		var error = desired.clone().subtract(this.loc);
		error.multiplyScalar(this.points);
		this.brain.train(forces,error);
	}

	this.getRotation = function() {
		return ((this.vel.direction() + 3.14/2)*180 )/3.14 ; 
	}
	this.getLocation = function() {
		return this.loc; 
	}
}