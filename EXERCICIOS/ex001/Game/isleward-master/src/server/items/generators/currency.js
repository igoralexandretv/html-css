let configCurrencies = require('../config/currencies');

let chances = [];
for (let c in configCurrencies.chance) {
	let rolls = configCurrencies.chance[c];
	for (let i = 0; i < rolls; i++) 
		chances.push(c);
}

module.exports = {
	generate: function (item, blueprint) {
		let pick = null;

		if (!blueprint.name)
			pick = chances[~~(Math.random() * chances.length)];
		else
			pick = Object.keys(configCurrencies.currencies).find(c => (c.toLowerCase().indexOf(blueprint.name.toLowerCase()) > -1));

		item.name = pick;
		extend(item, configCurrencies.currencies[pick]);
	}
};
