/*
see tutorial http://codetowin.io/tutorials/nback-game-states-and-menus/
*/
// ===================== GLOBAL VARIABELS AND SETTINGS =======================================
var GAME = GAME || {};

var gameWidth = 600;
var gameHeight =  400; 
var qKey;
var nKey;
var cursors;

GAME.game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, '');

// add all the states that the game has
//GAME.game.state.add('Preload', GAME.Preload);
GAME.game.state.add('Level', GAME.Level);

// begin with the preloading
GAME.game.state.start('Level');