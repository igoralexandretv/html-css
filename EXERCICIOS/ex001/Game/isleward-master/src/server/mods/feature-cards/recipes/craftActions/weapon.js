let itemGenerator = require('../../../../items/generator');

module.exports = (config, crafter) => {
	const slot = config.slot || ['oneHanded', 'twoHanded'][~~(Math.random() * 2)];

	const result = itemGenerator.generate({
		noSpell: true,
		slot,
		...config
	});

	crafter.inventory.getItem(result, false, false, false, true);

	const msg = `You received: ${result.name}`;

	return { msg };
};
