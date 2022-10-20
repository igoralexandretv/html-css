module.exports = {
	objects: {
		default: {

		}
	},
	mobs: {
		default: {
			level: 1,
			walkDistance: 1,

			spells: [{
				type: 'melee',
				statMult: 0.1356
			}],

			regular: {
				hpMult: 1,
				dmgMult: 1,

				drops: {
					chance: 40,
					rolls: 1
				}
			},

			rare: {
				count: 1,
				chance: 0.4,

				hpMult: 3,
				dmgMult: 1.5,

				drops: {
					chance: 100,
					rolls: 2,
					magicFind: 2000
				}
			}
		}
	}
};
