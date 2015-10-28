// A Group object that holds objects like obstacle or a target
// The object need to have a move function
var Groups = function(game, size, item) { //which item to do a group of, sort of a target or a Obstacle sort of
	this.numbers = size;
	this.game = game;
	this.allObjects = this.game.add.group();
	this.item = item;
};

Groups.prototype.initObjects = function() {
	this.allObjects.addMultiple(
		Array.from(new Array(this.numbers), () => new this.item(
			this.game,
			getRandomInt(40, WIDTH-40),
			getRandomInt(40, HEIGHT-40)
		))
	);
};

Groups.prototype.reposition = function() {
	this.allObjects.children.forEach(function(obj, i){
		obj.setRandomPosition();
		obj.setRandomDirection();
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