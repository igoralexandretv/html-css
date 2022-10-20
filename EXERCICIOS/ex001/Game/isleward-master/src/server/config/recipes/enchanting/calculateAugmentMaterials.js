const salvager = require('../../../items/salvager');

module.exports = (obj, [item]) => {
	let powerLevel = item.power || 0;
	let mult = null;
	if (powerLevel < 3)
		mult = [5, 10, 20][powerLevel];
	else
		return;

	const result = salvager.salvage(item, true);
	result.forEach(r => {
		r.quantity = Math.max(1, ~~(r.quantity * mult));
	});

	return result;
};
