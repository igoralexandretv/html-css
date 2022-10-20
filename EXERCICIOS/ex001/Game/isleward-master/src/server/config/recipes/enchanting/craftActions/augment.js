let generatorStats = require('../../../../items/generators/stats');

module.exports = (obj, [item]) => {
	let newPower = (item.power || 0) + 1;
	if (newPower > 3)
		return;

	item.power = newPower;

	const result = { msg: 'Augment successful', addStatMsgs: [] };

	generatorStats.generate(item, {
		statCount: 1
	}, result);

	return result;
};
