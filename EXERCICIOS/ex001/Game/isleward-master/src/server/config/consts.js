module.exports = {
	//At which interval does each zone tick in ms
	tickTime: 350,

	//The maximum level a player can reach
	maxLevel: 20,

	//Rune damage is multiplied by nth entry from this array where n = level - 1
	dmgMults: [0.25, 0.4, 0.575, 0.8, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2, 2.1, 2.2, 2.3, 2.4, 2.5],

	//Mob HP is multiplied by nth entry from this array where n = level - 1
	hpMults: [0.1, 0.2, 0.4, 0.7, 0.78, 0.91, 1.16, 1.19, 1.65, 2.36, 3.07, 3.55, 4.1, 4.85, 5.6, 5.9, 6.5, 7.1, 7.9, 12],

	//How far a player can see objects horizontally
	viewDistanceX: 25,

	//How far a player can see objects vertically
	viewDistanceY: 14
};
