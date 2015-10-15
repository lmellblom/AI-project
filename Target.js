var Target = function (game, x, y) {

	this.game = game;
	// Inherit from sprite
	Phaser.Sprite.call(this, game, x, y, 'diamond');
	this.scale.setTo(0.3);
	this.anchor.set(0.5);
	this.isActive = true;	// to be able to know if the target is taken or not.

	this.position = new Victor(x,y);
	this.radius = Math.max(this.height,this.width)/2.0; // the sprite itself has a width and a height
														// use this in order to determine the radiue


	//this.sprite = GAME.game.add.sprite(this.pos.x, this.pos.y, 'diamond');
}

Target.prototype = Object.create(Phaser.Sprite.prototype);
Target.prototype.constructor = Target;

Target.prototype.move = function(dt) {
	// standing still
};

Target.prototype.setRandomPosition = function(stage){
	//TODO: here we need to set the targets position withtin the boundaries of the stage.
	//in the meentime:
	this.x = getRandomInt(40, WIDTH-40);
	this.y = getRandomInt(40, HEIGHT-40);
	this.position.x = this.x;
	this.position.y = this.y;
}
