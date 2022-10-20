let events = require('../misc/events');

let spells = {
	melee: {
		auto: true,
		cdMax: 10,
		castTimeMax: 0,
		useWeaponRange: true,
		random: {
			damage: [3, 11.4]
		}
	},
	projectile: {
		auto: true,
		cdMax: 10,
		castTimeMax: 0,
		manaCost: 0,
		range: 9,
		random: {
			damage: [2, 7.2]
		}
	},

	'magic missile': {
		statType: 'int',
		statMult: 1,
		element: 'arcane',
		cdMax: 7,
		castTimeMax: 6,
		manaCost: 5,
		range: 9,
		random: {
			damage: [4, 32]
		}
	},
	'ice spear': {
		statType: 'int',
		statMult: 1,
		element: 'frost',
		cdMax: 10,
		castTimeMax: 2,
		manaCost: 4,
		range: 9,
		random: {
			damage: [2, 15],
			i_freezeDuration: [6, 10]
		}
	},
	fireblast: {
		statType: 'int',
		statMult: 1,
		element: 'fire',
		cdMax: 4,
		castTimeMax: 2,
		manaCost: 5,
		random: {
			damage: [2, 10],
			i_radius: [1, 2.2],
			i_pushback: [2, 5]
		}
	},
	smite: {
		statType: 'int',
		statMult: 1,
		element: 'holy',
		cdMax: 6,
		castTimeMax: 3,
		range: 9,
		manaCost: 7,
		random: {
			damage: [4, 14],
			i_stunDuration: [6, 10]
		}
	},
	consecrate: {
		statType: 'int',
		statMult: 1,
		element: 'holy',
		cdMax: 15,
		castTimeMax: 4,
		manaCost: 12,
		range: 9,
		radius: 3,
		random: {
			healing: [0.3, 0.5],
			i_duration: [7, 13]
		}
	},

	'healing touch': {
		statType: 'int',
		statMult: 1,
		element: 'holy',
		cdMax: 5,
		castTimeMax: 3,
		manaCost: 8,
		range: 9,
		random: {
			healing: [1, 3]
		}
	},

	slash: {
		statType: 'str',
		statMult: 1,
		threatMult: 4,
		cdMax: 9,
		castTimeMax: 1,
		manaCost: 4,
		useWeaponRange: true,
		random: {
			damage: [6, 23]
		}
	},
	charge: {
		statType: 'str',
		statMult: 1,
		threatMult: 3,
		cdMax: 14,
		castTimeMax: 1,
		range: 10,
		manaCost: 3,
		random: {
			damage: [2, 11],
			i_stunDuration: [6, 10]
		}
	},
	flurry: {
		statType: 'dex',
		statMult: 1,
		cdMax: 20,
		castTimeMax: 0,
		manaCost: 10,
		random: {
			i_duration: [10, 20],
			i_chance: [30, 60]
		}
	},
	whirlwind: {
		statType: 'str',
		statMult: 1,
		threatMult: 6,
		cdMax: 12,
		castTimeMax: 2,
		manaCost: 7,
		random: {
			i_range: [1, 2.5],
			damage: [4, 18]
		}
	},
	smokebomb: {
		statType: 'dex',
		statMult: 1,
		element: 'poison',
		cdMax: 7,
		castTimeMax: 0,
		manaCost: 6,
		random: {
			damage: [0.25, 1.2],
			i_radius: [1, 3],
			i_duration: [7, 13]
		}
	},
	ambush: {
		statType: 'dex',
		statMult: 1,
		cdMax: 15,
		castTimeMax: 3,
		range: 10,
		manaCost: 7,
		random: {
			damage: [8, 35],
			i_stunDuration: [4, 7]
		}
	},
	'crystal spikes': {
		statType: ['dex', 'int'],
		statMult: 1,
		manaCost: 14,
		needLos: true,
		cdMax: 15,
		castTimeMax: 0,
		range: 9,
		isAttack: true,
		random: {
			damage: [3, 18],
			i_delay: [1, 4]
		},
		negativeStats: [
			'i_delay'
		]
	},
	innervation: {
		statType: ['str'],
		statMult: 1,
		manaReserve: {
			percentage: 0.25
		},
		cdMax: 10,
		castTimeMax: 0,
		auraRange: 9,
		effect: 'regenHp',
		random: {
			regenPercentage: [0.3, 1.5]
		}
	},
	tranquility: {
		statType: ['int'],
		statMult: 1,
		element: 'holy',
		manaReserve: {
			percentage: 0.25
		},
		cdMax: 10,
		castTimeMax: 0,
		auraRange: 9,
		effect: 'regenMana',
		random: {
			regenPercentage: [4, 10]
		}
	},
	swiftness: {
		statType: ['dex'],
		statMult: 1,
		element: 'fire',
		manaReserve: {
			percentage: 0.4
		},
		cdMax: 10,
		castTimeMax: 0,
		auraRange: 9,
		effect: 'swiftness',
		random: {
			chance: [8, 20]
		}
	}

};

module.exports = {
	spells: spells,
	init: function () {
		events.emit('onBeforeGetSpellsConfig', spells);
	}
};
