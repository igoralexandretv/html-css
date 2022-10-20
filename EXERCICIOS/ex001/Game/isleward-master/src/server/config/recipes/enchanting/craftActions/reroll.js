let generatorStats = require('../../../../items/generators/stats');
let generatorSlots = require('../../../../items/generators/slots');
let generatorTypes = require('../../../../items/generators/types');

module.exports = (obj, [item]) => {
	const enchantedStats = item.enchantedStats;
	const implicitStats = item.implicitStats;

	delete item.enchantedStats;
	delete item.implicitStats;

	if ((item.stats) && (item.stats.lvlRequire)) {
		item.level = Math.min(consts.maxLevel, item.level + item.stats.lvlRequire);
		delete item.originalLevel;
	}

	item.stats = {};
	let bpt = {
		slot: item.slot,
		type: item.type,
		sprite: item.sprite,
		spritesheet: item.spritesheet
	};
	generatorSlots.generate(item, bpt);
	generatorTypes.generate(item, bpt);
	generatorStats.generate(item, bpt);

	for (let p in enchantedStats) {
		if (!item.stats[p])
			item.stats[p] = 0;

		item.stats[p] += enchantedStats[p];

		if (p === 'lvlRequire') {
			if (!item.originalLevel)
				item.originalLevel = item.level;

			item.level -= enchantedStats[p];
			if (item.level < 1)
				item.level = 1;
		}
	}
	item.enchantedStats = enchantedStats || null;

	//Some items have special implicits (different stats than their types imply)
	// We add the old one back in if this is the case. Ideally we'd like to reroll
	// these but that'd be a pretty big hack. We'll solve this one day
	if (
		item.implicitStats &&
		implicitStats &&
		item.implicitStats[0] &&
		implicitStats[0] &&
		item.implicitStats[0].stat !== implicitStats[0].stat
	)
		item.implicitStats = implicitStats;

	return { msg: 'Reroll successful' };
};
