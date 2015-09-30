/* Obstacle constructor */
var Obstacle = function (game, x, y) {
	this.r = 3.0;
	// arbitrary values
	this.maxSpeed = 50;

	this.game = game;
	this.position = new Victor(x, y);
	this.velocity = new Victor(2*Math.random()-1, 2*Math.random()-1)
		.norm()
		.multiply(new Victor(50, 50)); // short for multiply
	this.circle = new Phaser.Circle(this.position.x, this.position.y, 64);
	this.graphics = this.game.add.graphics();
}


Obstacle.prototype = {

	render: function (){
		this.graphics.clear();
		this.graphics.beginFill(0xFF0000, 0.7);
		this.graphics.drawShape(this.circle);
		//this.graphics.drawCircle(this.position.e(1), this.position.e(2), 64);
	},

	move: function(dt) {
		if( this.position.x > this.game.world.width ||
			this.position.x < 0 ){
			this.velocity.x *= -1;
		} else if (this.position.y > this.game.world.height ||
			this.position.y < 0){
			this.velocity.y *= -1;
		}
		this.position = this.position.add(this.velocity
			.clone()
			.multiply(new Victor(dt, dt)));
		this.circle.x = this.position.x;
		this.circle.y = this.position.y;

		this.render();
	}
}