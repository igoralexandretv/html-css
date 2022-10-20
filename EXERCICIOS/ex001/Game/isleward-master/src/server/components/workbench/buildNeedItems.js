module.exports = ({ inventory: { items } }, { needItems }) => {
	if (!needItems)
		return null;

	const result = needItems.map(n => {
		const { info, withProps = [], withoutProps = [], checks = [] } = n;

		const allowedItemIds = items
			.filter(item => {
				const isValidItem = (
					withProps.every(p => item.has(p)) &&
					withoutProps.every(p => !item.has(p)) &&
					checks.every(c => c(item))
				);

				return isValidItem;
			})
			.map(item => item.id);

		const needItem = {
			info,
			allowedItemIds
		};

		return needItem;
	});

	return result;
};
