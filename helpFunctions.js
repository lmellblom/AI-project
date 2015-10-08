// ========================== Help functions ==========================
function getRandom(min, max) {
	return Math.random() * (max-min) + min;
}

function getRandomInt(min, max) { // a gloat
	return Math.floor(Math.random() * (max-min) + min);
}

// limits the magnitude of the in vec that is an Victory obj to the value that is given if the magnitude of that vector
// is larget than the limit
function limitMagnitude(vec, value) {
	if (vec.lengthSq() >= value*value) {
		vec.normalize();
		vec.multiplyScalar(value);
	}
}

// gets a random Victory vector between width and height
function randomTarget(w, h) {
	var t = new Victor(getRandom(0+20, w-20), getRandom(0+20, h-20)); // a target vector getRandom
	return t;
}

/*
	This function projects the center point of the circle on the line,
	then checks if the length of that projected vector is smaller than the radius,
	if it is, then a intersection has taken place.
	Use pythagoras theorem to find the intersection point.
	Only works with victor.js
	@arg {Victor object} linePoint - Starting point of line
	@arg {Victor object} direction - Direction of line
	@arg {Number} length - length of line
	@arg {Victor object} circlePoint - coords Center of circle
	@arg {Number} radius - The circles radius
	@returns {Number} - value between 0-1 where 0  is no intersection and 1 is
						intersection very close to mover
 */
function intersectLineCircle(linePoint, direction, length, circlePoint, radius) {

	// if circle is behind this rays direction.
	if(direction.dot(circlePoint.clone().subtract(linePoint)) < 0){
		return 0;
	}
	var n = direction // normalized vector in the direction of line
		.clone()
		.norm();
	var pa = linePoint
		.clone()
		.subtract(circlePoint); //get vector from p->n
	// p projected on line x = a + tn is => pa - (pa*n)n
	var projectedVector = pa
		.clone()
		.subtract(n.multiplyScalar(pa.dot(n)));
	var projectedPoint = projectedVector.clone().add(circlePoint);
	if(projectedVector.length() > radius){
		return 0;
	}
	// pythagoras b = sqrt( a^2 - c^2 )
	var intersectedLength = Math.sqrt(Math.abs(Math.pow(projectedVector.length(), 2) - Math.pow(radius, 2)))
	var linePrim = projectedPoint.clone().subtract(linePoint); // linePoint -> projectedPoint
	// when intersection point is close to mover, return value close to 1
	// when intersection point is far from mover, return value close to 0
	var distFromIntersect = Math.abs(linePrim.length() - intersectedLength);
	return (distFromIntersect < length) ?
		1 - (distFromIntersect / length) : 0;
}