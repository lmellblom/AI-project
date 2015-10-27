var Obstacle = function (game, x, y) {
	this.maxSpeed = 100;

	this.game = game;
	
	// Inherit from sprite
	Phaser.Sprite.call(this, game, x, y, 'obstacle');
	//this.scale.setTo(0.2);
	//this.scale.setTo(1.2);
	this.anchor.set(0.5);
	//this.tint = 0x007A35;
	this.isActive = true;	// to be able to know if the target is taken or not.

	this.radius = Math.max(this.height,this.width)/2.0; // the sprite itself has a width and a height
														// use this in order to determine the radiue

	this.position = new Victor(x, y);
	this.velocity = new Victor(7*Math.random()-1, 0)//7*Math.random()-1)
		.norm()
		.multiply(new Victor(30, 30)); // short for multiply
}

Obstacle.prototype = Object.create(Phaser.Sprite.prototype);
Obstacle.prototype.constructor = Obstacle;

Obstacle.prototype.move = function(dt) {
	// standing still
	if( this.position.x > this.game.world.width ||
			this.position.x < 0 ){
			this.velocity.x *= -1;
			this.scale.x *= -1;
		} else if (this.position.y > this.game.world.height ||
			this.position.y < 0){
			this.velocity.y *= -1;
			this.scale.x *= -1;
		}
		this.position = this.position.add(this.velocity
			.clone()
			.multiply(new Victor(dt, dt)));

		// reposition the sprite
		this.x = this.position.x;
		this.y = this.position.y;
};