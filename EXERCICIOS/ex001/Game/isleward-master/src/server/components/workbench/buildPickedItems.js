const buildNeedItems = require('./buildNeedItems');

module.exports = (crafter, recipe, { pickedItemIds = [] }) => {
	const needItems = buildNeedItems(crafter, recipe);

	const { inventory: { items } } = crafter;

	const result = pickedItemIds.map((pickedId, i) => {
		const item = items.find(f => f.id === pickedId);
		const isItemValid = needItems[i].allowedItemIds.includes(item.id);

		if (!isItemValid)
			return null;
		
		return item;
	});

	return result;
};
