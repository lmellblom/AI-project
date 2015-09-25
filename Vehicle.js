var DNA = function(n) {
	this.genes = new Array(n);
	this.fitness = 0;
	// adding random genes

	
		for (var i=0; i<this.genes.length-1; i++) {
			this.genes[i] = getRandom(-1,1);
		}
		this.genes[this.genes.length-1] = 1; 

	this.setFitness = function(nr) {
		this.fitness = nr;
	}

	this.crossover = function (partner) {
		console.log("partner" + partner);
		// take half from one partner and the rest from the other.
		var crossIndex = Math.floor(this.genes.length/2);
		var newGenes = new Array();
		var i;

		newGenes[0] = this.genes[0];
		newGenes[1] = partner.genes[1];
		newGenes[2] = partner.genes[2];

		/*for (i=0; i<crossIndex; i++) {
			newGenes[i] = this.genes[i];
		}
		for(var j = i; j<this.genes.length; j++) {
			newGenes[j] = partner.genes[j];
		}*/
		return newGenes;
	}

	this.mutate = function (mutationRate) {
		for (var i=0; i<this.genes.length; i++) {
			this.genes[i] = this.genes[i]; // if over mutationrate, add something here?
		}
	}
}

function mate(population) {
	var matingPool = new Array();
	for (var i=0; i<population.length; i++) {
		//console.log(population[i].DNA);
		var n = Math.ceil(population[i].DNA.fitness * 10) + 1;
		console.log(n);
		for (var j=0; j<n; j++) {		// add the memeber n times according to fitness score
			matingPool.push(population[i].DNA);
		}
	}


	// reproduce the population!! overwrite the population with a new one? 
	for (var i=0; i<population.length; i++) {
		var a = Math.floor(random(0,matingPool.length));
		var b = Math.floor(random(0,matingPool.length));

		var partnerA = matingPool[a];
		var partnerB = matingPool[b];

		// new child.
		var child = partnerA.crossover(partnerB);
		//child.mutate(0.2);

		population[i] = child;
	}

	return population;
}



// ================================================================

// help function
function getRandom(min, max) { // a gloat
	return Math.random() * (max-min) + min; 
}

function getRandomInt(min, max) { // a gloat
	return Math.floor(Math.random() * (max-min) + min); 
}

// ========== A simple neural network ==========================
var Perceptron = function(setWeights, c) {
	// local variabels
	this.weights = new Array(setWeights.length); // creates an array with n undefined elements
	this.c = c; // learning constants

	for (var i = 0; i < setWeights.length; i++) {
		this.weights[i] = setWeights[i];//getRandom(-1,1); 
	}

}
/*
Perceptron.prototype.feedforward = function(inputs) {
	var sum = 0;
	for (var i = 0; i < this.weights.length; i++) {
		sum +=  inputs[i] * this.weights[i];
	}

	return (sum > 0 ? 1 : -1); // the sign of the sum
}*/
// for the vechicle class
Perceptron.prototype.feedforward = function(forces) {
	var sum = new Victor(0.0,0.0);

	for (var i=0; i<this.weights.length; i++){
		var f = forces[i].clone();
		f.multiplyScalar(this.weights[i]);
		sum.add(f);

	}

	return sum;
}

function limitMagnitude(vec, value) {
	if (vec.lengthSq() >= value*value) {
		vec.normalize();
		vec.multiplyScalar(value);
	}
}
/*

 */// provide the inputs as an array and the desired ouput as an float
Perceptron.prototype.train = function(inputs, desired) { 
	var guess = this.feedforward(inputs);
	var error = desired - guess;

	// adjust the weight according to the error and learning constant. newW = w + dW, där dW = error*input
	for (var i = 0; i < this.weights.length; i++) {
		this.weights[i] += this.c * error * inputs[i]; 
	}
}*/
// train for the vechile
// provide the inputs as an array and the desired ouput as an float
Perceptron.prototype.train = function(forces, error) {
	// adjust the weight according to the error and learning constant. newW = w + dW, där dW = error*input
	for (var i = 0; i < this.weights.length; i++) {
		this.weights[i] += this.c * error.x * forces[i].x;
		this.weights[i] += this.c * error.y * forces[i].y; 
	}
}

// ================================================================
var Trainer = function(x, y, a){
	this.inputs = [x, y, 1]; // the 1 is the bias.
	this.answer = a; 
}

// ================================================================
var Vehicle = function (theDNA, x, y, maxSpeed, maxForce) {
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
		//console.log(this.vel.toString());
		this.vel.add(this.a);
		//this.vel.limit(this.maxSpeed, 0.5);
		limitMagnitude(this.vel, this.maxSpeed);
		this.loc.add(this.vel);
		this.a.multiplyScalar(0.0);
	}

	this.applyForce = function(force) {
		this.a.add(force);
	}

	this.seek = function(t) {
		var target = t.vector;
		var desired = target.clone();
		desired.subtract(this.loc);//PVector.sub(target, this.loc);
		desired.normalize();
		desired.multiplyScalar(this.maxSpeed);
		var steer = desired.clone();// PVector.sub(desired, this.vel);
		steer.subtract(this.vel);
		limitMagnitude(steer, this.maxForce);
		//steer.limit(this.maxForce, 0.5); // göra egen sådan här!// limit the magnitude..
		//this.applyForce(steer);
		return steer;
	}


	// a seek function that takes in a array instead of target vectors
	this.steer = function(targets) {
		var forces = new Array();

		for (var i=0; i<targets.length; i++) {
			forces[i] = this.seek(targets[i]);
		}


		//var ouput = brain.process(forces);
		var result = this.brain.feedforward(forces);
		this.applyForce(result);

		// train the network! if we use GA instead this will not be used!!!!
		//var desired = new Victor(width/2, height/2);
		//var error = desired.clone().subtract(this.loc);
		//error.multiplyScalar(this.points);
		//this.brain.train(forces,error);
	}

	this.display = function() {
		var theta = this.vel.direction() + 3.14/2;
		fill(175);
		stroke(0);
		push();
		translate(this.loc.x, this.loc.y);
		rotate(theta);
		beginShape();
		vertex(0,this.r * -2);
		vertex(-1*this.r,this.r * 2);
		vertex(this.r , this.r*2);
		endShape(CLOSE);
		pop();
	}


	this.dead = function() {
		this.alive = false;
		this.DNA.setFitness(this.points);
		console.log("points: " + this.points);
	}
}


// ================================================================

// drawing with p5.js, need a setup and a draw function
var allTargets, movers, targetColors;
var nrOfTargets = 3;
var targetWidth = 20;
var populationSize = 5;
var population;

function setup(){
	createCanvas(640,360);

	population = new Array(populationSize);
	
	for (var i=0; i<population.length; i++) {
		population[i] = new DNA(3);
	}

	movers = new Array();
	for (var i=0; i<populationSize; i++) {
		movers[i] = new Vehicle(population[i],
								getRandom(0+20, width-20),
								getRandom(0+20, height-20),
								getRandom(0, 3.0),
								getRandom(0,0.4));
	}

	//movers[0] = new Vehicle(3, 420,200, 2.0 , 0.2); //
	//movers[1] = new Vehicle(3, 100,30 , 3.0, 0.1);
	//target = new Victor(100,120);

	allTargets = new Array(nrOfTargets);
	targetColor = fill(getRandomInt(0,255),getRandomInt(0,255),getRandomInt(0,255));
	for (var i = 0; i<nrOfTargets; i++) {
		var t = new Object();
		// new Victor(getRandom(0+targetWidth, width-targetWidth), getRandom(0+targetWidth, height-targetWidth));
		// a target vector getRandom
		t.vector = randomTarget(width, height);
		t.reward = getRandom(0,4) <= 3 ? true : false;
		allTargets[i] = t;
	}

}

function draw() {
	background(255);

	//target.x = mouseX;
	//target.y = mouseY;

	var target;
	for (var i = 0; i<nrOfTargets; i++) {
		if (allTargets[i].reward)
			targetColor;
		else
			fill(0,43,2);
		target = allTargets[i].vector; 
		ellipse(target.x, target.y, targetWidth,targetWidth);
	}

	// check for collision between a mover and a target? in that case öka points? 
	for (var i=0; i<movers.length;i++) {
		if (!movers[i].alive)
			continue;
		for(var j=0; j<nrOfTargets; j++) {

			var error = allTargets[j].vector.clone().subtract(movers[i].loc);

			//console.log("error between (mover,target)" +  i + "," + j + " : "  + error.magnitude());
			if (error.magnitude() < 5){
				if(allTargets[j].reward)
					movers[i].points++;
				else {
					movers[i].dead();	
					populationSize--;
				}			

				allTargets[j].vector = randomTarget(width, height);

			}
		}

		// check if out of boundary?
		if (movers[i].loc.x>width || movers[i].loc.x<0 || movers[i].loc.y>height || movers[i].loc.y<0) {
			movers[i].dead();
			populationSize--;
		}

	} 

	if(populationSize<=1)
	{
		console.log("generate a new population!!");
		//movers
		var newPopulation = mate(movers);
		for (var i=0; i<movers.length; i++) {
			newPopulation[i].alive = true;
			newPopulation[i].points = 0;
		}
		movers = newPopulation;
		populationSize = movers.length;
	}

	for (var i=0; i<movers.length; i++) {
		var mover = movers[i];
		if(mover.alive) {
			mover.steer(allTargets);
			mover.update();
			mover.display();
		}
	}



}

function randomTarget(w, h) {
	var t = new Victor(getRandom(0+20, w-20), getRandom(0+20, h-20)); // a target vector getRandom
	return t;
}	


