module.exports = {
	generators: {
		catchChance: function (item, blueprint) {
			return random.expNorm(0, 60);
		},

		catchSpeed: function (item, blueprint) {
			return random.expNorm(0, 150);
		},

		fishRarity: function (item, blueprint) {
			return random.expNorm(0, 100);
		},

		fishWeight: function (item, blueprint) {
			return random.expNorm(0, 75);
		},

		fishItems: function (item, blueprint) {
			return random.expNorm(0, 50);
		}
	},

	generate: function (item, blueprint, result) {
		let statCount = blueprint.statCount || (item.quality + 1);
		let stats = Object.keys(this.generators);

		if (!item.stats)
			item.stats = {};

		for (let i = 0; i < statCount; i++) {
			let stat = stats[~~(Math.random() * stats.length)];
			let value = Math.ceil(this.generators[stat].call(this, item, blueprint));

			if (result) {
				result.addStatMsgs.push({
					stat: stat,
					value: value
				});
			}

			if (!item.stats[stat])
				item.stats[stat] = 0;

			item.stats[stat] += value;

			if (blueprint.statCount) {
				if (!item.enchantedStats)
					item.enchantedStats = {};
				if (item.enchantedStats[stat])
					item.enchantedStats[stat] += value;
				else
					item.enchantedStats[stat] = value;
			}
		}
	}
};
