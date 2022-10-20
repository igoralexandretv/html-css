module.exports = {
	currencies: {
		'Unstable Idol': {
			quantity: 1,
			quality: 1,
			description: 'Rerolls the stats on an item',
			material: true,
			sprite: [1, 8],
			action: 'reroll'
		},
		'Ascendant Idol': {
			quantity: 1,
			quality: 2,
			description: 'Increases the level of an item',
			material: true,
			sprite: [3, 8],
			action: 'relevel'
		},
		'Dragon-Glass Idol': {
			quantity: 1,
			quality: 3,
			description: 'Rerolls an item\'s slot',
			material: true,
			sprite: [6, 8],
			action: 'reslot'
		},
		'Bone Idol': {
			quantity: 1,
			quality: 3,
			description: 'Rerolls a weapon\'s damage',
			material: true,
			sprite: [7, 8],
			action: 'reforge'
		},
		'Smoldering Idol': {
			quantity: 1,
			quality: 4,
			description: 'Removes all augments from an item',
			material: true,
			sprite: [8, 8],
			action: 'scour'
		}
	},

	chance: {
		'Unstable Idol': 37,
		'Ascendant Idol': 15,
		'Dragon-Glass Idol': 5,
		'Bone Idol': 6,
		'Smoldering Idol': 1
	},

	getCurrencyFromAction: function (action) {
		let currencies = this.currencies;
		let pick = Object.keys(currencies).find(o => (currencies[o].action === action));

		return extend({
			name: pick
		}, currencies[pick]);
	}
};
