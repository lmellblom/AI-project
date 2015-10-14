var Wall = function (game, x0, y0, x1, y1) {
	// Inherit from sprite (call its constructor)
	//Phaser.Line.call(this, x0, y0, y1, y1);
	this.game = game;
	this.x0 = x0;
	this.y0 = y0;
	this.x1 = x1;
	this.y1 = y1;
	this.graphics = game.add.graphics();
	console.log(this);
};

// get lines methods and extend with more methods
/*Wall.prototype = Object.create(Phaser.Line.prototype);
Wall.prototype.constructor = Wall;*/

Wall.prototype.draw = function() {
/*	this.graphics.clear();
	this.graphics.beginFill(0xFF0000, 0.7);
	this.graphics.drawShape(this);*/
	//this.game.debug.geom(this);
	// set a fill and line style again
	this.graphics.lineStyle(10, 0x105544, 0.8);
	this.graphics.beginFill(0xFF700B, 1);

	// draw a second shape
	this.graphics.moveTo(this.x0, this.y0);
	this.graphics.lineTo(this.x1, this.y1);
	this.graphics.endFill();
}


