var Wall = function (game, x0, y0, x1, y1) {
	this.game = game;
	this.x0 = x0;
	this.y0 = y0;
	this.x1 = x1;
	this.y1 = y1;

	this.wallPoint = new Victor(this.x0, this.y0);
	this.wallVector = new Victor(this.x1 - this.x0, this.y1 - this.y0);
	this.graphics = game.add.graphics();
	this.thickness = 1;
	console.log(this);
};

Wall.prototype.draw = function() {
	// set a fill and line style again
	this.graphics.lineStyle(10, 0x105544, 0.8);
	this.graphics.beginFill(0xFF700B, 1);
	this.graphics.moveTo(this.x0, this.y0);
	this.graphics.lineTo(this.x1, this.y1);
	this.graphics.endFill();
}


