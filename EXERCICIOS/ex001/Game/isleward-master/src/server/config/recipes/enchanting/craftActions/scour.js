module.exports = (obj, [item]) => {
	if (!item.power)
		return;

	const result = { msg: 'Scour successful', addStatMsgs: [] };

	for (let p in item.enchantedStats) {
		let value = item.enchantedStats[p];

		if (item.stats[p]) {
			result.addStatMsgs.push({
				stat: p,
				value: -value
			});

			item.stats[p] -= value;
			if (item.stats[p] <= 0)
				delete item.stats[p];

			if (p === 'lvlRequire') {
				item.level = Math.min(consts.maxLevel, item.level + value);
				delete item.originalLevel;
			}
		}
	}

	delete item.enchantedStats;
	delete item.power;

	return result;
};
