let events = require('../misc/events');

module.exports = {
	list: ['bear', 'owl', 'lynx'],
	portraits: {
		bear: {
			x: 0,
			y: 0
		},
		owl: {
			x: 2,
			y: 0
		},
		lynx: {
			x: 3,
			y: 0
		}
	},
	spells: {
		owl: ['magic missile', 'ice spear'],
		bear: ['slash', 'charge'],
		lynx: ['flurry', 'smokebomb']
	},
	stats: {
		owl: {
			values: {
				hpMax: 35,
				hpPerLevel: 32
			},
			gainStats: {
				int: 1
			}
		},
		lynx: {
			values: {
				hpMax: 45,
				hpPerLevel: 36
			},
			gainStats: {
				dex: 1
			}
		},
		bear: {
			values: {
				hpMax: 55,
				hpPerLevel: 40
			},
			gainStats: {
				str: 1
			}
		}
	},
	weapons: {
		owl: 'Gnarled Staff',
		lynx: 'Dagger',
		bear: 'Sword'
	},

	getSpritesheet: function (className) {
		return this.stats[className].spritesheet || 'characters';
	},

	init: function () {
		events.emit('onBeforeGetSpirits', this);
	}
};
