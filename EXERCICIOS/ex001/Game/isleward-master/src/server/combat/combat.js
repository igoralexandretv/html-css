//Imports
const avoid = require('./avoid');
const scale = require('./scale');
const mitigate = require('./mitigate');

//Method
const getDamage = config => {
	const { damage, element } = config;

	//Add convenience properties
	config.srcValues = config.source.stats.values;
	config.tgtValues = config.target.stats.values;
	if (element)
		config.elementName = `element${element[0].toUpperCase()}${element.substr(1)}`;

	const result = {
		amount: damage,
		blocked: false,
		dodged: false,
		crit: false,
		element
	};

	avoid(config, result);
	scale(config, result);
	mitigate(config, result);

	//Remove convenience properties
	delete config.srcValues;
	delete config.tgtValues;
	delete config.elementName;

	return result;
};

//Exports
module.exports = {
	getDamage
};
