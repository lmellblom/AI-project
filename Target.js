var Target = function (game, x, y) {

	this.game = game;
	// Inherit from sprite
	Phaser.Sprite.call(this, game, x, y, 'diamond');
	this.scale.setTo(0.7);
	this.anchor.set(0.5);
	this.isActive = true;	// to be able to know if the target is taken or not.

	this.pos = new Victor(x,y);

	//this.sprite = GAME.game.add.sprite(this.pos.x, this.pos.y, 'diamond');
}

Target.prototype = Object.create(Phaser.Sprite.prototype);
Target.prototype.constructor = Target;

Target.prototype.move = function(dt) {
	// standing still
};
