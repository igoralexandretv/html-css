let itemGenerator = require('../../../../items/generator');

module.exports = (config, crafter) => {
	const result = itemGenerator.generate({
		...config,
		spell: true
	});

	crafter.inventory.getItem(result, false, false, false, true);

	const msg = `You received: ${result.name}`;

	return { msg };
};
