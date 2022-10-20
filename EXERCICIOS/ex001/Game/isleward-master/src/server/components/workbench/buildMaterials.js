const buildPickedItems = require('./buildPickedItems');

module.exports = (crafter, recipe, msg) => {
	const { inventory: { items } } = crafter;
	const { materialGenerator, materials, needItems = [] } = recipe;
	const { pickedItemIds = [] } = msg;

	const pickedItems = buildPickedItems(crafter, recipe, msg);
	const allPickedItemsSet = (
		pickedItemIds.length === needItems.length &&
		!pickedItems.some(i => !i)
	);

	if (!allPickedItemsSet)
		return [];

	let useMaterials = materials;

	if (materialGenerator)
		useMaterials = materialGenerator(crafter, pickedItems);

	const result = useMaterials.map(m => {
		const { name, nameLike, quantity } = m;

		const haveMaterial = items.find(i => (
			i.name === name ||
			i.name.includes(nameLike)
		));

		const id = haveMaterial ? haveMaterial.id : null;
		const haveQuantity = haveMaterial ? (haveMaterial.quantity || 1) : 0;
		const needQuantity = quantity;

		const noHaveEnough = haveQuantity < needQuantity;

		const material = {
			id,
			name,
			nameLike,
			haveQuantity,
			needQuantity,
			noHaveEnough
		};

		return material;
	});

	return result;
};
