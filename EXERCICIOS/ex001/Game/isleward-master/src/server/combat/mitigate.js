//Prebound Methods
const max = Math.max.bind(Math);
const pow = Math.pow.bind(Math);

//Helpers
const mitigateResistances = ({ elementName, noMitigate, tgtValues }, result) => {
	//Don't mitigate physical damage
	if (!elementName)
		return;

	const resist = tgtValues[elementName + 'Resist'] || 0;

	const resistanceMultiplier = max(0.5 + max((1 - (resist / 100)) / 2, -0.5), 0.5);

	result.amount *= resistanceMultiplier;
};

const mitigateArmor = ({ element, tgtValues, srcValues }, result) => {
	//Don't mitigate elemental damage
	if (element)
		return;

	const armorMultiplier = max(0.5 + max((1 - ((tgtValues.armor || 0) / (srcValues.level * 50))) / 2, -0.5), 0.5);

	result.amount *= armorMultiplier;
};

const mitigatePvp = ({ source, target, srcValues }, result) => {
	const isPvp = (
		(source.player || (source.follower && source.follower.master && source.follower.master.player)) &&
		(target.player || (target.follower && target.follower.master && target.follower.master.player))
	);

	if (!isPvp)
		return;

	const multiplier = 1 / pow(2, srcValues.level / 5);

	result.amount *= multiplier;
};

//Method
const mitigate = (config, result) => {
	const { blocked, dodged } = result; 

	//Heals, among other things, should not be mitigated
	if (blocked || dodged || config.noMitigate)
		return;

	mitigateResistances(config, result);
	mitigateArmor(config, result);
	mitigatePvp(config, result);
};

//Exports
module.exports = mitigate;
