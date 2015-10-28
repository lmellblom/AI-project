var Target = function (game, x, y) {

	this.game = game;
	// Inherit from sprite
	Phaser.Sprite.call(this, game, x, y,  'seacreatures', 'prawn0000');
	this.scale.setTo(0.3);
	this.anchor.set(0.5);
	this.isActive = true;	// to be able to know if the target is taken or not.

	this.position = new Victor(x,y);
	this.radius = Math.max(this.height,this.width)/2.0; // the sprite itself has a width and a height
														// use this in order to determine the radiue

	this.scale.x = (Math.random() > 0.5) ? -0.3 : 0.3;
	this.bounceFunction = (Math.random() > 0.5) ? Math.sin : Math.cos;
	this.strafeFunction = (Math.random() > 0.5) ? Math.sin : Math.cos;
	this.timeVariable = 0;
}

Target.prototype = Object.create(Phaser.Sprite.prototype);
Target.prototype.constructor = Target;

Target.prototype.move = function(dt) {
	this.timeVariable = (this.timeVariable>2*Math.PI) ? 0 : this.timeVariable+dt;
	this.position.y += this.bounceFunction(this.timeVariable)/8;
	this.position.x += this.strafeFunction(this.timeVariable)/6;
};

Target.prototype.setRandomPosition = function(stage){
	this.x = getRandomInt(40, WIDTH-40);
	this.y = getRandomInt(40, HEIGHT-40);
	this.position.x = this.x;
	this.position.y = this.y;
}
