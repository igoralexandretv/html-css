let itemGenerator = require('../../../../items/generator');

module.exports = ({ level, quality, slot, perfection }, crafter) => {
	const result = itemGenerator.generate({
		level,
		noSpell: true,
		quality,
		perfection,
		slot
	});

	crafter.inventory.getItem(result, false, false, false, true);

	const msg = `You received: ${result.name}`;

	return { msg };
};
