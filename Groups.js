// A Group object that holds like obstacle or a target
// Work quite nice for now.
// The object need to have a move function
var Groups = function(game, size, item) { //which item to do a group of, sort of a target or a Obstacle sort of
	this.numbers = size;
	this.game = game;
	this.allObjects = this.game.add.group();

	this.allObjects.enableBody = true;
	this.allObjects.physicsBodyType = Phaser.Physics.ARCADE;

	this.item = item;
};

Groups.prototype.initObjects = function() {
	this.allObjects.addMultiple(
		Array.from(new Array(this.numbers), () => new this.item(
			this.game,
			800*Math.random(), //WIDTH, set a global variable instead?
			600*Math.random() //HEIGHT
		))
	);
};

Groups.prototype.reposition = function() {
	this.allObjects.children.forEach(function(obj, i){
		// this.game.world.height
		// this.numbers
		var padding = 62 ;//+ this.game.world.height/this.numbers; 
		var paddingY = (i==0 || i==1 || i==4 || i==5 || i==8 || i==9) ? 0 : this.game.world.width ; 

		obj.y = 20 + i*padding;
		obj.x = 0 + paddingY;

	}, this);
};


Groups.prototype.update = function(dt) {
	this.allObjects.forEach((obj) => obj.move(dt));
}

Groups.prototype.getGroup = function() {
	return this.allObjects;
}

Groups.prototype.revive = function() {
	this.allObjects.forEach( (obj) => obj.revive());
}