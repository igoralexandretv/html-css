let configSlots = require('../../../../items/config/slots');
let generator = require('../../../../items/generator');

module.exports = (obj, [item]) => {
	if (item.effects || item.slot === 'tool')
		return;

	if (item.originalLevel)
		item.level = item.originalLevel;

	delete item.enchantedStats;

	let possibleStats = Object.keys(item.stats || {});

	let newItem = generator.generate({
		slot: configSlots.getRandomSlot(item.slot),
		level: item.level,
		quality: item.quality,
		stats: possibleStats,
		limitSlotStats: true
	});

	delete item.spritesheet;
	delete item.stats;
	delete item.spell;
	delete item.implicitStats;
	delete item.power;
	delete item.range;
	delete item.requires;

	extend(item, newItem);

	const msg = `Reslotted item to slot: ${item.slot}`;

	return { msg };
};
