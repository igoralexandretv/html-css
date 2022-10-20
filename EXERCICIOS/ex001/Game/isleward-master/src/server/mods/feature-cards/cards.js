let config = {
	'Runecrafter\'s Toil': {
		chance: 0.025,
		reward: 'Level 10 Rune',
		mobLevel: [8, 12]
	},
	'Godly Promise': {
		chance: 0.01,
		reward: 'Level 15 Legendary Weapon',
		zone: 'sewer'
	},
	'The Other Heirloom': {
		chance: 0.02,
		reward: 'Perfect Level 10 Ring',
		mobName: 'flamingo'
	},
	'Benthic Incantation': {
		chance: 0.015,
		reward: 'Princess Morgawsa\'s Trident',
		zone: 'estuary'
	},
	'Fangs of Fury': {
		chance: 0.05,
		reward: 'Steelclaw\'s Bite',
		mobName: 'stinktooth'
	},
	'Tradesman\'s Pride': {
		chance: 0.007,
		reward: 'Five Random Idols'
	}
};

module.exports = {
	getCard: function (modFolderPath, looter, mob) {
		let pool = [];

		let mobLevel = mob.stats.values.level;

		let configs = extend({}, config);
		looter.instance.eventEmitter.emit('onBeforeGetCardsConfig', configs);

		Object.keys(configs).forEach(function (c) {
			let card = configs[c];
			if (!card.chance)
				return;

			let rqrLevel = card.mobLevel;
			if (rqrLevel) {
				if ((rqrLevel.push) && ((mobLevel < rqrLevel[0]) || (mobLevel > rqrLevel[1])))
					return;
				else if ((!rqrLevel.push) && (mobLevel !== rqrLevel))
					return;
			}
			let mobName = card.mobName;
			if (mobName) {
				if ((mobName.toLowerCase) && (mob.name.toLowerCase() !== mobName.toLowerCase()))
					return;
				else if ((mobName.push) && (!mobName.some(m => (m.toLowerCase() === mob.name.toLowerCase()))))
					return;
			}

			if ((card.zone) && (looter.zoneName !== card.zone))
				return;

			if (Math.random() >= card.chance)
				return;

			pool.push(c);
		}, this);

		if (pool.length === 0)
			return;

		let pickName = pool[~~(Math.random() * pool.length)];
		let pick = configs[pickName];

		let builtCard = {
			name: pickName,
			spritesheet: pick.spritesheet || `${modFolderPath}/images/items.png`,
			type: 'Gambler\'s Card',
			noSalvage: true,
			sprite: pick.sprite || [0, 0],
			quantity: 1,
			quality: pick.quality || 1
		};

		return builtCard;
	}
};
