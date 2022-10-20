let itemGenerator = require('../../../../items/generator');

module.exports = ({ rolls, quantity = 1 }, crafter) => {
	let quantityReceived = rolls * quantity;

	for (let i = 0; i < rolls; i++) {
		const idol = itemGenerator.generate({
			currency: true,
			quantity
		});

		crafter.inventory.getItem(idol, false, false, false, true);
	}

	const msg = `You received ${quantityReceived} idols`;

	return { msg };
};
