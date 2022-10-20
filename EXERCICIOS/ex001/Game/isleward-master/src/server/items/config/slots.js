module.exports = {
	slots: [
		'head',
		'neck',
		'chest',
		'hands',
		'finger',
		'waist',
		'legs',
		'feet',
		'trinket',
		'oneHanded',
		'twoHanded',
		'offHand',
		'tool'
	],

	chance: {
		head: 85,
		neck: 45,
		chest: 100,
		hands: 90,
		finger: 40,
		waist: 80,
		legs: 100,
		feet: 90,
		trinket: 35,
		oneHanded: 60,
		twoHanded: 60,
		offHand: 40,
		tool: 0
	},

	armorMult: {
		head: 0.2,
		chest: 0.4,
		hands: 0.1,
		legs: 0.2,
		feet: 0.1
	},

	getRandomSlot: function (exclude) {
		let chances = [];
		for (let c in this.chance) {
			if (c === exclude)
				continue;

			let rolls = this.chance[c];
			for (let i = 0; i < rolls; i++) 
				chances.push(c);
		}

		return chances[~~(Math.random() * chances.length)];
	}
};
