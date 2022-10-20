module.exports = (obj, [item]) => {
	if (item.slot === 'tool')
		return;

	let offset = 1 + ~~(Math.random() * 2);

	const maxLevel = consts.maxLevel;

	if (!item.originalLevel)
		item.level = Math.min(maxLevel, item.level + offset);
	else {
		offset = Math.min(maxLevel - item.originalLevel, offset);
		item.originalLevel = Math.min(maxLevel, item.originalLevel + offset);
		item.level = Math.min(maxLevel, item.level + offset);
	}

	const msg = `Relevelled item to level ${item.level}`;

	return { msg };
};
