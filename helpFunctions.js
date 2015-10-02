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