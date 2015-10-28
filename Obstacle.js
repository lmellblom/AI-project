var Obstacle = function (game, x, y) {
	this.maxSpeed = 100;

	this.game = game;
	// Inherit from sprite
	Phaser.Sprite.call(this, game, x, y, 'obstacle');
	//this.scale.setTo(0.2);
	this.anchor.set(0.5);
	this.isActive = true;	// to be able to know if the target is taken or not.
	this.speed = 45;
	this.radius = Math.max(this.height,this.width)/2.0; // the sprite itself has a width and a height
														// use this in order to determine the radiue
	this.position = new Victor(x, y);
	this.velocity = new Victor(7*Math.random()-1, 0)
		.norm()
		.multiplyScalar(this.speed);
	this.spawnRadius = Math.sqrt(Math.pow(WIDTH/2, 2) + Math.pow(HEIGHT/2, 2));
}

Obstacle.prototype = Object.create(Phaser.Sprite.prototype);
Obstacle.prototype.constructor = Obstacle;

Obstacle.prototype.move = function(dt) {
	var centerPoint = new Victor(this.game.world.centerX, this.game.world.centerY);
	var distFromCenter = centerPoint.subtract(this.position).length();
	if(distFromCenter > this.spawnRadius+5){
		this.setRandomPosition();
		this.setRandomDirection();
	}
	this.velocity.rotate(getRandom(-0.02, 0.02))
	this.position = this.position.add(this.velocity
		.clone()
		.multiplyScalar(dt));

	// reposition the sprite
	this.x = this.position.x;
	this.y = this.position.y;
	this.angle = this.getRotation()+90;
};

Obstacle.prototype.setRandomPosition = function(){
	var direction = new Victor(getRandom(-1, 1), getRandom(-1, 1))
		.norm()
		.multiplyScalar(this.spawnRadius);
	console.log(this.position)
	this.position = direction.add(new Victor(this.game.world.centerX, this.game.world.centerY));
}
Obstacle.prototype.setRandomDirection = function(){
	this.velocity = centerDirection = new Victor(this.game.world.centerX, this.game.world.centerY)
		.subtract(this.position)
		.norm()
		.rotate(getRandom(-1, 1)*(Math.PI/4))
		.multiplyScalar(this.speed);

	this.scale.y = (this.velocity.x > 0) ? -1 : 1;
}
Obstacle.prototype.getRotation = function() {
	return ((this.velocity.direction() + Math.PI/2)*180 )/Math.PI ;
};